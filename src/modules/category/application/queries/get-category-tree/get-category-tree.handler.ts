import { Inject, Injectable } from '@nestjs/common';
import { CATEGORY_REPOSITORY } from '../../category-repository.token';
import type { CategoryRepository } from '../../../domain/repositories/category.repository';
import { CategoryTreeNodeDto } from '../../dtos/category-tree-node.dto';

@Injectable()
export class GetCategoryTreeHandler {
  constructor(
    @Inject(CATEGORY_REPOSITORY)
    private readonly categoryRepository: CategoryRepository,
  ) {}

  async execute(): Promise<CategoryTreeNodeDto[]> {
    const flat = await this.categoryRepository.findAllActive();
    const idSet = new Set(flat.map((c) => c.id!));

    const nodeById = new Map<string, CategoryTreeNodeDto>();
    for (const c of flat) {
      if (!c.id) continue;
      nodeById.set(c.id, {
        id: c.id,
        name: c.categoryName.value,
        parentId: c.parentId,
        status: c.status,
        children: [],
      });
    }

    const roots: CategoryTreeNodeDto[] = [];
    for (const c of flat) {
      if (!c.id) continue;
      const node = nodeById.get(c.id)!;
      const pid = c.parentId;
      if (pid && idSet.has(pid)) {
        nodeById.get(pid)!.children.push(node);
      } else {
        roots.push(node);
      }
    }

    const sortRecursive = (nodes: CategoryTreeNodeDto[]) => {
      nodes.sort((a, b) => a.name.localeCompare(b.name, 'vi'));
      for (const n of nodes) sortRecursive(n.children);
    };
    sortRecursive(roots);

    return roots;
  }
}
