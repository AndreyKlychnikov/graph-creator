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
    vertex_ids_map = {}
    for i, vertex in enumerate(vertices):
        vertex_ids_map[vertex] = i
    for edge in edges.edges:
        graph.add_edge(vertex_ids_map[edge.source], vertex_ids_map[edge.target], edge.value)
    dists, paths = graph.dijkstra(edges.source_vertex - 1)
    vertex_ids_map_rev = {v: k for k, v in vertex_ids_map.items()}
    out_paths = {}
    for dest_id, path in enumerate(paths):
        out_paths[vertex_ids_map_rev[dest_id]] = [vertex_ids_map_rev[node_id] for node_id in path]
    return {'result': dists[vertex_ids_map[edges.target_vertex]], 'paths': out_paths}
