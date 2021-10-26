from queue import PriorityQueue


class Graph:
    def __init__(self, num_of_vertices):
        self.v = num_of_vertices
        self.edges = [[-1 for i in range(num_of_vertices)] for j in range(num_of_vertices)]
        self.visited = []
        self.paths = [list() for _ in range(self.v)]

    def add_edge(self, u, v, weight):
        self.edges[u][v] = weight

    def dijkstra(self, start_vertex):
        D = {v: float('inf') for v in range(self.v)}
        D[start_vertex] = 0

        pq = PriorityQueue()
        pq.put((0, start_vertex))

        while not pq.empty():
            (dist, current_vertex) = pq.get()
            self.visited.append(current_vertex)

            for neighbor in range(self.v):
                if self.edges[current_vertex][neighbor] != -1:
                    distance = self.edges[current_vertex][neighbor]
                    if neighbor not in self.visited:
                        old_cost = D[neighbor]
                        new_cost = D[current_vertex] + distance
                        if new_cost < old_cost:
                            pq.put((new_cost, neighbor))
                            D[neighbor] = new_cost
                            self.paths[neighbor] = list(self.paths[current_vertex])
                            self.paths[neighbor].append(current_vertex)
        return D, self.paths


if __name__ == '__main__':
    graph = Graph(4)
    graph.add_edge(0, 1, 1)
    graph.add_edge(0, 2, 2)
    graph.add_edge(0, 3, 3)
    graph.add_edge(1, 3, 1)
    print(graph.dijkstra(0))
    print(graph.paths)
