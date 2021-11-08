from typing import List

from pydantic import BaseModel


class Edge(BaseModel):
    source: str
    target: str
    value: int


class Edges(BaseModel):
    source_vertex: str
    target_vertex: str
    edges: List[Edge]
