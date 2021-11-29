import json
import math
from typing import List

from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware

from floyd import get_weights_matrix_from_edges, floyd_min_path, get_path
from dijkstra import Graph
from schemes import DijkstraRequest, GraphEdges, InputEdge, Edge

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
async def dijkstra(edges: DijkstraRequest):
    indexer = GraphIndexer(edges.edges)
    graph = Graph(len(indexer.vertices))

    for edge in indexer.edges:
        graph.add_edge(edge.source, edge.target, edge.value)
    dists, paths = graph.dijkstra(indexer.vertex_ids_map[edges.source_vertex])

    path = paths[indexer.vertex_ids_map[edges.target_vertex]]

    path.append(indexer.vertex_ids_map[edges.target_vertex])
    out_path = []
    for i in range(1, len(path)):
        out_path.append({
            "source": indexer.vertex_ids_map_rev[path[i - 1]],
            "target": indexer.vertex_ids_map_rev[path[i]],
        })
    distance = dists[indexer.vertex_ids_map[edges.target_vertex]]
    if distance == math.inf:
        return {'error': 'Path not found.'}
    return {'result': distance, 'path': out_path}


@app.post("/graph-from-file/")
async def graph_from_file(file: UploadFile = File(...)):
    content = await file.read()
    return json.loads(content)


@app.post("/floyd/")
async def floyd(edges: GraphEdges):
    indexer = GraphIndexer(edges.edges)

    weights = get_weights_matrix_from_edges(indexer.edges, len(indexer.vertices))
    min_lengths, prev = floyd_min_path(weights)
    paths = []
    for i in range(len(min_lengths)):
        for j in range(len(min_lengths)):
            if i != j and min_lengths[i][j] != math.inf:
                paths.append({
                    'source': indexer.vertex_ids_map_rev[i],
                    'target': indexer.vertex_ids_map_rev[j],
                    'path_length': min_lengths[i][j],
                    'path': [indexer.vertex_ids_map_rev[node] for node in get_path(prev, i, j)]
                })
    return {'result': paths}


class GraphIndexer:
    def __init__(self, edges: List[InputEdge]):
        self.vertices = {edge.source for edge in edges}
        self.vertices |= {edge.target for edge in edges}
        self.vertex_ids_map = {}
        for i, vertex in enumerate(sorted(self.vertices)):
            self.vertex_ids_map[vertex] = i
        self.vertex_ids_map_rev = {v: k for k, v in self.vertex_ids_map.items()}

        self.edges = self.transform_edges(edges)

    def transform_edges(self, edges) -> List[Edge]:
        tmp_edges = []
        for edge in edges:
            edge_ = Edge(
                source=self.vertex_ids_map[edge.source],
                target=self.vertex_ids_map[edge.target],
                value=int(edge.value)
            )
            tmp_edges.append(edge_)
        return tmp_edges
