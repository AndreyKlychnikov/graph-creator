import math
from typing import List, Union, Tuple

from schemes import Edge

MatrixType = List[List[Union[int, float]]]


def floyd_min_path(weights: MatrixType) -> Tuple[MatrixType, MatrixType]:
    n = len(weights)
    mtx = [[weights[i][j] for j in range(n)] for i in range(n)]
    prev = [[i for j in range(n)] for i in range(n)]
    for k in range(n):
        for i in range(n):
            for j in range(n):
                if mtx[i][k] != math.inf and mtx[k][j] != math.inf and mtx[i][k] + mtx[k][j] < mtx[i][j]:
                    mtx[i][j] = mtx[i][k] + mtx[k][j]
                    prev[i][j] = prev[k][j]
    return mtx, prev


def get_weights_matrix_from_edges(edges: List[Edge], num_of_vertices) -> MatrixType:
    mtx = [[math.inf for _ in range(num_of_vertices)] for _ in range(num_of_vertices)]
    for edge in edges:
        mtx[edge.source][edge.target] = edge.value
    return mtx


def get_path(prev_mtx: MatrixType, source, target):
    prev = prev_mtx[source]
    path = []
    while target != source:
        path.append(target)
        target = prev[target]
    return path[::-1]
