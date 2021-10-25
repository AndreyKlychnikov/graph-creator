from typing import List

from pydantic import BaseModel


class Edge(BaseModel):
    source: int
    target: int
    value: int


class Edges(BaseModel):
    source_vertex: int
    target_vertex: int
    edges: List[Edge]
