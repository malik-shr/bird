import { UserTable } from '@shared/db.types';
import { sse, t } from 'elysia';
import { Kysely } from 'kysely';

export const aiRequest = t.Object({
  message: t.String(),
});

export async function* promptResponse(
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
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: message },
      ],
    }),
  });

  if (!response.body) {
    yield sse({ event: 'error', data: 'No streaming response received' });
    return;
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let assistantMessage = '';

  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');

    // keep the last line in the buffer (might be incomplete JSON)
    buffer = lines.pop() ?? '';

    for (const line of lines) {
      if (!line.trim()) continue;

      if (line === 'data: [DONE]') {
        await db
          .insertInto('messages')
          .values({
            id: crypto.randomUUID(),
            role: 'assistant',
            content: assistantMessage,
            user: user.id,
          })
          .execute();

        yield sse({ event: 'end', data: 'done' });
        return;
      }

      if (line.startsWith('data: ')) {
        const jsonStr = line.slice(6);

        try {
          const data = JSON.parse(jsonStr);
          const token = data.choices?.[0]?.delta?.content;
          if (token) {
            assistantMessage += token;
            yield sse({ event: 'message', data: token });
          }
        } catch (err) {
          console.error('JSON parse error, line:', jsonStr, err);
        }
      }
    }
  }

  // flush any remaining buffer if needed
  if (buffer.trim() && buffer.startsWith('data: ')) {
    try {
      const data = JSON.parse(buffer.slice(6));
      const token = data.choices?.[0]?.delta?.content;
      if (token) {
        assistantMessage += token;
        yield sse({ event: 'message', data: token });
      }
    } catch (err) {
      console.error('Final buffer parse error:', buffer, err);
    }
  }
}
