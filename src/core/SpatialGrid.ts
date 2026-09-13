export interface GridEntity {
  x: number;
  y: number;
  radius: number;
  isAlive: boolean;
}

export class SpatialGrid<T extends GridEntity> {
  private cellSize: number;
  private grid: Map<string, T[]> = new Map();

  constructor(cellSize: number = 120) {
    this.cellSize = cellSize;
  }

  public clear() {
    this.grid.clear();
  }

  private getKey(cx: number, cy: number): string {
    return `${cx}:${cy}`;
  }

  public insert(entity: T) {
    if (!entity.isAlive) return;
    const minCx = Math.floor((entity.x - entity.radius) / this.cellSize);
    const maxCx = Math.floor((entity.x + entity.radius) / this.cellSize);
    const minCy = Math.floor((entity.y - entity.radius) / this.cellSize);
    const maxCy = Math.floor((entity.y + entity.radius) / this.cellSize);

    for (let cx = minCx; cx <= maxCx; cx++) {
      for (let cy = minCy; cy <= maxCy; cy++) {
        const key = this.getKey(cx, cy);
        let list = this.grid.get(key);
        if (!list) {
          list = [];
          this.grid.set(key, list);
        }
        list.push(entity);
      }
    }
  }

  public query(x: number, y: number, radius: number): T[] {
    const minCx = Math.floor((x - radius) / this.cellSize);
    const maxCx = Math.floor((x + radius) / this.cellSize);
    const minCy = Math.floor((y - radius) / this.cellSize);
    const maxCy = Math.floor((y + radius) / this.cellSize);

    const results: Set<T> = new Set();

    for (let cx = minCx; cx <= maxCx; cx++) {
      for (let cy = minCy; cy <= maxCy; cy++) {
        const key = this.getKey(cx, cy);
        const list = this.grid.get(key);
        if (list) {
          for (let i = 0; i < list.length; i++) {
            const item = list[i];
            if (!item.isAlive) continue;
            const dx = item.x - x;
            const dy = item.y - y;
            const combinedRadius = radius + item.radius;
            if (dx * dx + dy * dy <= combinedRadius * combinedRadius) {
              results.add(item);
            }
          }
        }
      }
    }

    return Array.from(results);
  }
}
