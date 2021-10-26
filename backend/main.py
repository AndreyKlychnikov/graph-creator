from queue import PriorityQueue

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from dijkstra import Graph
from schemes import Edges

origins = [
    "http://localhost",
    "http://127.0.0.1",
    "http://localhost:8000",
    "http://localhost:3000",
    "http://127.0.0.1:8000",
    "*",
]

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/dijkstra/")
async def dijkstra(edges: Edges):
    vertices = {edge.source for edge in edges.edges}
    vertices |= {edge.target for edge in edges.edges}
    graph = Graph(len(vertices))
    for edge in edges.edges:
        graph.add_edge(edge.source - 1, edge.target - 1, edge.value)
    dists, paths = graph.dijkstra(edges.source_vertex - 1)
    return {'result': dists[edges.target_vertex - 1], 'paths': paths}
