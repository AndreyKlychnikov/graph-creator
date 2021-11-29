from typing import List

from pydantic import BaseModel


class InputEdge(BaseModel):
    source: str
    target: str
    value: int


class DijkstraRequest(BaseModel):
    source_vertex: str
    target_vertex: str
    edges: List[InputEdge]


class GraphEdges(BaseModel):
    edges: List[InputEdge]


class Edge(BaseModel):
    source: int
    target: int
    value: int
