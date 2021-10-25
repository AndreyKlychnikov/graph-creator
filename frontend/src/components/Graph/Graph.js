import {GraphView} from "react-digraph";

import React, {useRef, useState} from "react";

import {
  Button,
  FormControl,
  Grid, InputLabel, MenuItem,
  Paper, Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField
} from "@material-ui/core";

import "./Graph.css";
import {default as nodeConfig} from "./config";
import axios from "axios";

const sample = {
  edges: [],
  nodes: []
};
const GraphConfig = nodeConfig;

const NODE_KEY = "id"; // Allows D3 to correctly update DOM

export default function Graph() {
  // this is the initial value of the state
  const [nodes, setNodes] = useState(sample.nodes);
  const [edges, setEdges] = useState(sample.edges);
  const [nextNodeId, setNextNodeId] = useState(1);
  const [selected, setSelected] = useState({nodes: null, edges: null});
  const [dijkstraTarget, setDijkstraTarget] = useState("");
  const [dijkstraSource, setDijkstraSource] = useState("");
  const [dijkstraResult, setDijkstraResult] = useState("");
  // const inputEdgeRef = React.useRef();
  // const inputNodeRef = React.useRef();

  const myRef = useRef("someval?");

  const NodeTypes = GraphConfig.NodeTypes;
  const NodeSubtypes = GraphConfig.NodeSubtypes;
  const EdgeTypes = GraphConfig.EdgeTypes;

  function sendDijkstra() {
    axios.post('http://127.0.0.1:8000/dijkstra', {
      source_vertex: +dijkstraSource,
      target_vertex: +dijkstraTarget,
      edges: edges.map(edge => ({
        source: +edge.source,
        target: +edge.target,
        value: +edge.handleText
      }))
    }).then(function (response) {
      setDijkstraResult(response.data.result)
    })

  }

  function onCreateEdge(src, tgt) {
    console.log("onCreateEdge")
    const newEdge = {
      source: src.id,
      target: tgt.id,
      type: "specialEdge",
      handleText: "0"
    };
    setEdges((prev) => [...prev, newEdge]);
    let edges = new Map();
    edges.set(`${newEdge.source}_${newEdge.target}`, newEdge)
    console.log("setSelected")
    setSelected({nodes: null, edges: edges})
    // inputEdgeRef.current.focus();
  }

  function onCreateNodeClick(x, y) {
    console.log("onCreateNodeClick")
    const type = "poly";
    const title = "" + nextNodeId;
    const viewNode = {
      id: "" + nextNodeId,
      title,
      type,
      x,
      y
    };
    setNextNodeId(nextNodeId + 1);
    setNodes((prev) => [...prev, viewNode]);
  }

  function onSelect(selected) {
    console.log("onSelect")
    setSelected(selected);
    console.log("onSelect2")
  }
  function onDeleteNode(viewNode) {
    console.log("onDeleteNode")
    // Delete any connected edges
    const newEdges = edges.filter((edge) => {
      return edge.source !== viewNode.id && edge.target !== viewNode.id;
    });

    var newNodes = nodes.filter((node) => {
      return node.id !== viewNode.id;
    });

    setEdges(newEdges);
    setNodes(newNodes);
  }

  function onSwapEdge(sourceViewNode, targetViewNode, viewEdge) {
    console.log("onSwapEdge")
    const index = edges.findIndex(edge => edge.source === viewEdge.source && edge.target === viewEdge.target)

    const edge = {
      ...viewEdge,
      source: sourceViewNode.id,
      target: targetViewNode.id
    };

    let newEdges = [...edges];
    newEdges[index] = edge;
    setEdges(newEdges);
  }
  function onDeleteSelected(e) {
    console.log("onDeleteSelected")
    if (e.nodes) {
      onDeleteNode(e.nodes.values().next().value)
    } else if (e.edges) {
      onDeleteEdge(e.edges.values().next().value)
    }
  }
  function onDeleteEdge(edge) {
    console.log("onDeleteEdge")
    const index = edges.indexOf(edge);
    if (index > -1) {
      let newEdges = [...edges]
      newEdges.splice(index, 1)
      setEdges(newEdges);
    }
  }
  function setEdgeValue(value, source_id, target_id) {
    console.log("setEdgeValue")
    if (source_id === target_id) return;
    let newEdges = []
    const idx = edges.findIndex(value => value.source === source_id && value.target === target_id);
    if (value === "") {
      newEdges = [...edges]
      newEdges.splice(idx, 1)
    } else if (idx !== -1) {
      newEdges = [...edges];
      newEdges[idx].handleText = +value + "";
    } else {
      newEdges = [
        ...edges,
        {
          handleText: value,
          source: source_id,
          target: target_id,
          type: "specialType"
        }
      ];
    }
    setEdges(newEdges);
  }
  return (
    <div
      id="graph"
      style={{
        backgroundColor: "white",
        height: "100%",
        width: "100%",
        textAlign: "left"
      }}
    >
      <Grid container direction="row">
        {/*<Grid item xs={2}>*/}
        {/*  <Grid container direction="column" spacing={1}>*/}
        {/*    {selected.nodes &&*/}
        {/*      <Grid item>*/}
        {/*        <TextField*/}
        {/*          id="node_edit_val"*/}
        {/*          label="Node name"*/}
        {/*          variant="outlined"*/}
        {/*          disabled={!selected.nodes}*/}
        {/*          inputRef={inputNodeRef}*/}
        {/*          value={selected.nodes.values().next().value.title}*/}
        {/*          onChange={(e) => setCurNodeVal(e.target.value)}*/}
        {/*        />*/}
        {/*      </Grid>*/}
        {/*    }*/}
        {/*    {selected.edges &&*/}
        {/*      <Grid item>*/}
        {/*        <TextField*/}
        {/*          id="edge_edit_val"*/}
        {/*          label="Edge value"*/}
        {/*          variant="outlined"*/}
        {/*          type={"number"}*/}
        {/*          disabled={!selected.edges}*/}
        {/*          inputRef={inputEdgeRef}*/}
        {/*          value={selected.edges.values().next().value.handleText}*/}
        {/*          onChange={(e) => setCurEdgeVal(e.target.value)}*/}
        {/*        />*/}
        {/*      </Grid>*/}
        {/*    }*/}
        {/*    {!selected.nodes && !selected.edges &&*/}
        {/*      <p>Select edge or node for editing</p>*/}
        {/*    }*/}
        {/*  </Grid>*/}
        {/*</Grid>*/}

        <Grid item xs={7}>
          <div
            style={{
              height: "100vh",
              backgroundColor: "black"
            }}
          >
            <GraphView
              ref={myRef}
              nodeKey={NODE_KEY}
              nodes={nodes}
              edges={edges}
              selected={selected}
              nodeTypes={NodeTypes}
              nodeSubtypes={NodeSubtypes}
              edgeTypes={EdgeTypes}
              allowMultiselect={false}
              onCreateNode={(x, y) => onCreateNodeClick(x, y)}
              onDeleteNode={(viewNode, nodeId, nodeArr) =>
                onDeleteNode(viewNode, nodeId, nodeArr)
              }
              onCreateEdge={(src, tgt) => onCreateEdge(src, tgt)}
              onSwapEdge={(src, tgt, view) => onSwapEdge(src, tgt, view)}
              onDeleteSelected={(e) => onDeleteSelected(e)}
              onSelect={(entity) => onSelect(entity)}
            />
          </div>
        </Grid>
        <Grid item xs={5}>
          <Grid container>
            <Grid item>
              <TableContainer component={Paper}>
                <Table aria-label="custom pagination table">
                  <TableHead>
                    <TableRow>
                      <TableCell>Source</TableCell>
                      <TableCell>Target</TableCell>
                      <TableCell>Value</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(edges).map((edge) => (
                        <TableRow key={`${edge.source}_${edge.target}`}>
                          <TableCell>
                            <TextField
                                value={edge.source}
                                variant="outlined"
                                size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <TextField
                                value={edge.target}
                                variant="outlined"
                                size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <TextField
                                type={"number"}
                                value={edge.handleText}
                                variant="outlined"
                                size="small"
                                onChange={(e) => setEdgeValue(e.target.value, edge.source, edge.target)}
                            />
                          </TableCell>
                        </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
            <Grid item>
              <FormControl fullWidth>
                <InputLabel id="dijkstra_source">Select node</InputLabel>
                <Select
                    labelId="dijkstra_source"
                    id="dijkstra_source_select"
                    value={dijkstraSource}
                    label="Target"
                    onChange={e => setDijkstraSource(e.target.value)}
                    variant="outlined"
                >
                  {nodes.map(node => (
                      <MenuItem value={node.id}>{node.id}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel id="dijkstra_target">Select node</InputLabel>
                <Select
                    labelId="dijkstra_target"
                    id="dijkstra_target_select"
                    value={dijkstraTarget}
                    label="Target"
                    onChange={e => setDijkstraTarget(e.target.value)}
                    variant="outlined"
                >
                  {nodes.map(node => (
                      <MenuItem value={node.id}>{node.id}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Button onClick={sendDijkstra}>Dijkstra!</Button>
              <TextField value={dijkstraResult}/>
            </Grid>

          </Grid>
        </Grid>
      </Grid>
    </div>
  );
}
