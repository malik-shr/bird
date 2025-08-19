import { UserTable } from '@shared/db.types';
import { sse, t } from 'elysia';
import { Kysely } from 'kysely';

export const aiRequest = t.Object({
  message: t.String(),
});

export async function* getAiResponse(
  message: string,
  user: UserTable,
  db: Kysely<DB>
) {
  await db
    .insertInto('messages')
    .values({
      id: crypto.randomUUID(),
      role: 'user',
      content: message,
      user: user.id,
    })
    .execute();

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, // <- make sure this is set
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      stream: true,
      messages: [
        { role: 'system', content: 'Du bist ein hilfreicher Assistent.' },
        { role: 'user', content: message },
      ],
    }),
  });

  if (!response.body) {
    yield sse({ event: 'error', data: 'Keine Stream-Response erhalten!' });
    return;
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let assistantMessage = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value);
    const lines = chunk.split('\n').filter((l) => l.trim() !== '');

    for (const line of lines) {
      if (line === 'data: [DONE]') {
        await db
          .insertInto('messages')
          .values({
            id: crypto.randomUUID(),
            role: 'system',
            content: assistantMessage,
            user: user.id,
          })
          .execute();
        yield sse({ event: 'end', data: 'done' });
        return;
      }

      if (line.startsWith('data: ')) {
        try {
          const data = JSON.parse(line.slice(6));
          const token = data.choices?.[0]?.delta?.content;
          if (token) {
            assistantMessage += token;
            yield sse({ event: 'message', data: token });
          }
        } catch (err) {
          console.error('Fehler beim Parsen:', err, line);
        }
      }
    }
  }
}
