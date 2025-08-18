import { Bird } from '../Bird';

export default class FileService {
  private bird: Bird;

  constructor(bird: Bird) {
    this.bird = bird;
  }
}
