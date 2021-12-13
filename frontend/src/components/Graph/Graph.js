import {GraphView} from "react-digraph";

import React, {useEffect, useRef, useState} from "react";

import "./Graph.css";
import {default as nodeConfig, EMPTY_EDGE_TYPE, RED_EMPTY_EDGE_TYPE} from "./config";
import axios from "axios";
import copyTextToClipboard from '../../utils/clipboard'
import {
  Accordion, AccordionDetails, AccordionSummary,
  Button,
  FormControl,
  Grid, InputLabel,
  MenuItem, Paper, Select,
  Table,
  TableBody,
  TableCell, TableContainer,
  TableHead,
  TableRow,
  TextField, Typography
} from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

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
  const [dijkstraError, setDijkstraError] = useState("");
  const [dijkstraPath, setDijkstraPath] = useState("");
  const [dijkstraTime, setDijkstraTime] = useState("");
  const [floydTime, setFloydTime] = useState("");
  const [curEdge, setCurEdge] = useState(null)
  const [paths, setPaths] = useState([])
  const [dijkstraPaths, setDijkstraPaths] = useState([])
  const inputEdgeRef = React.useRef();

  const myRef = useRef("someval?");

  const NodeTypes = GraphConfig.NodeTypes;
  const NodeSubtypes = GraphConfig.NodeSubtypes;
  const EdgeTypes = GraphConfig.EdgeTypes;

  useEffect(() => {
      if (selected.edges) setCurEdge(selected.edges.entries().next().value[1])
    },
    [selected]
  )
  useEffect(() => {
      if (curEdge) inputEdgeRef.current.focus();
    }, [curEdge]
  )
  function test() {
    draw_pkg(edges[0], 0.7)
    hide_pkg(edges[0])
  }
  function draw_pkg(edge, position) {
    const edgeContainer = document.getElementById(`edge-${edge.source}-${edge.target}-container`);
    const label =  edgeContainer.getElementsByClassName('edge-label-text')[0]
    label.innerHTML = '📜'
    label.classList.add('visible')

    const source = nodes.find(node => node.id === edge.source)
    const target = nodes.find(node => node.id === edge.target)

    const x_dist = target.x - source.x
    const y_dist = target.y - source.y

    const transformText = label.getAttribute('transform')
    console.log(transformText)
    label.setAttribute('transform', `translate(${source.x + x_dist * position}, ${source.y + y_dist * position})`)
  }
  function hide_pkg(edge) {
    const edgeContainer = document.getElementById(`edge-${edge.source}-${edge.target}-container`);
    const label =  edgeContainer.getElementsByClassName('edge-label-text')[0]
    label.classList.remove('visible')
  }
  function sendDijkstra() {
    setDijkstraError("");
    axios.post('http://127.0.0.1:8000/dijkstra', {
      source_vertex: dijkstraSource,
      target_vertex: dijkstraTarget,
      edges: edges.map(edge => ({
        source: edge.source,
        target: edge.target,
        value: +edge.handleText
      }))
    }).then(function (response) {
      if (response.data.error) return setDijkstraError(response.data.error)
      setDijkstraResult(response.data.result)
      setDijkstraPath(pathToString(response.data.path))
      highlightPath(response.data.path)
    })

  }
  function sendFloyd() {
    const edges_ = edges.map(edge => ({
      source: edge.source,
      target: edge.target,
      value: +edge.handleText
    }))
    axios.post('http://127.0.0.1:8000/dijkstra-all', {
      edges: edges_
    }).then(function (response) {
      setDijkstraPaths(response.data.result.map(el => ({...el, path: el.path.join(' -> ')})).sort((a, b) => {
        if (a.source - b.source !== 0) return a.source - b.source;
        return a.target - b.target;
      }))
    })
    axios.post('http://127.0.0.1:8000/floyd', {
      edges: edges_
    }).then(function (response) {
      setPaths(response.data.result.map(el => ({...el, path: [el.source, ...el.path].join(' -> ')})).sort((a, b) => {
        if (a.source - b.source !== 0) return a.source - b.source;
        return a.target - b.target;
      }))
    })
    axios.post('http://127.0.0.1:8000/algorithm-comparison', {
      edges: edges_
    }).then(function (response) {
      setDijkstraTime(response.data.dijkstra)
      setFloydTime(response.data.floyd)
    });
  }
  function pathToString(path) {
    let nodes = path.map(edge => edge.target)
    nodes.unshift(path[0].source)
    return nodes.join(' -> ')
  }
  function uploadGraph(graphFile) {
    if (!graphFile) return;
    setNodes([]);
    setEdges([])
    const formData = new FormData();
    formData.append("file", graphFile);
    axios.post('http://127.0.0.1:8000/graph-from-file', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }).then(function (response) {
      const nodes = response.data.nodes
      const edges = response.data.edges
      setNodes(nodes ? nodes: []);
      setEdges(edges ? edges: [])
    })
  }
  function graphToJson() {
    return JSON.stringify({edges, nodes})
  }
  function onCreateEdge(src, tgt) {
    console.log("onCreateEdge")
    const newEdge = {
      source: src.id,
      target: tgt.id,
      type: EMPTY_EDGE_TYPE,
      handleText: "0",
      label_from: '📜',
      label_to: ' '
    };
    setEdges((prev) => [...prev, newEdge]);
    let edges = new Map();
    edges.set(`${newEdge.source}_${newEdge.target}`, newEdge)
    console.log("setSelected")
    setSelected({nodes: null, edges: edges})
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

    const newNodes = nodes.filter((node) => {
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
          type: EMPTY_EDGE_TYPE
        }
      ];
    }
    setEdges(newEdges);
  }

  function highlightPath(path) {
    const newEdges = edges.map(edge => {
      if (path.find(pathEdge => pathEdge.source === edge.source && pathEdge.target === edge.target)) {
        return {
          ...edge,
          type: RED_EMPTY_EDGE_TYPE
        }
      }
      return {
        ...edge,
        type: EMPTY_EDGE_TYPE
      }
    })
    setEdges(newEdges)
  }

  function removeHighlight() {
    const newEdges = edges.map(edge => ({
      ...edge,
      type: EMPTY_EDGE_TYPE
    }))
    setEdges(newEdges)
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
        <Grid item xs={5} style={{maxHeight: '100vh', overflow: 'auto'}}>
          <Grid item>
            <Accordion>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1a-content"
                id="panel1a-header"
              >
                <Typography>Lab 1. Dijkstra</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container direction={"column"} spacing={2} style={{padding: 10}}>
                  <Grid item aria-orientation={"horizontal"}>
                    <Grid container spacing={1}>
                      <Grid item xs={6}>
                        <FormControl fullWidth>
                          <InputLabel id="dijkstra_source">Source</InputLabel>
                          <Select
                            labelId="dijkstra_source"
                            id="dijkstra_source_select"
                            value={dijkstraSource}
                            label="Target"
                            onChange={e => setDijkstraSource(e.target.value)}
                            variant="outlined"
                          >
                            {nodes.map(node => (
                              <MenuItem key={node.id} value={node.id}>{node.id}</MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={6}>
                        <FormControl fullWidth>
                          <InputLabel id="dijkstra_target">Target</InputLabel>
                          <Select
                            labelId="dijkstra_target"
                            id="dijkstra_target_select"
                            value={dijkstraTarget}
                            label="Target"
                            onChange={e => setDijkstraTarget(e.target.value)}
                            variant="outlined"
                          >
                            {nodes.map(node => (
                              <MenuItem key={node.id} value={node.id}>{node.id}</MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                    </Grid>

                  </Grid>
                  <Grid item>
                    <Button variant="contained" onClick={sendDijkstra}>Dijkstra!</Button>
                  </Grid>
                  <Grid item>
                    <Grid container>
                      <Grid item xs={6}>
                        <TextField value={dijkstraResult} variant={"outlined"} disabled={true}/>
                      </Grid>
                      <Grid item xs={6}>
                        <TextField value={dijkstraPath} variant={"outlined"} disabled={true}/>
                      </Grid>
                    </Grid>
                  </Grid>
                  <Grid item>
                    {dijkstraError}
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>
            <Accordion>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel2a-content"
                id="panel2a-header"
              >
                <Typography>Lab 2. Dijkstra and Floyd</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container direction={"column"} spacing={2} style={{padding: 10}}>
                  <Grid item aria-orientation={"horizontal"}>
                    <Button variant="contained" onClick={sendFloyd}>Calculate!</Button>
                    {dijkstraTime && <Typography>Dijkstra: {dijkstraTime.toFixed(3)} ms</Typography>}
                    {floydTime && <Typography>Floyd: {floydTime.toFixed(3)} ms</Typography>}
                  </Grid>
                  <Grid container direction={"row"} spacing={2} style={{padding: 10}}>
                    <Grid item xs={6}>
                      <Typography>Floyd</Typography>
                      <TableContainer component={Paper}>
                        <Table aria-label="custom pagination table" size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Source</TableCell>
                              <TableCell>Target</TableCell>
                              <TableCell>Length</TableCell>
                              <TableCell>Path</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {(paths).map((path) => (
                              <TableRow key={`${path.source}_${path.target}`}>
                                <TableCell>
                                  <Typography>{path.source}</Typography>
                                </TableCell>
                                <TableCell>
                                  <Typography>{path.target}</Typography>
                                </TableCell>
                                <TableCell>
                                  <Typography>{path.path_length}</Typography>
                                </TableCell>
                                <TableCell>
                                  <Typography>{path.path}</Typography>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography>Dijkstra</Typography>
                      <TableContainer component={Paper}>
                        <Table aria-label="custom pagination table" size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Source</TableCell>
                              <TableCell>Target</TableCell>
                              <TableCell>Length</TableCell>
                              <TableCell>Path</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {(dijkstraPaths).map((path) => (
                              <TableRow key={`${path.source}_${path.target}`}>
                                <TableCell>
                                  <Typography>{path.source}</Typography>
                                </TableCell>
                                <TableCell>
                                  <Typography>{path.target}</Typography>
                                </TableCell>
                                <TableCell>
                                  <Typography>{path.path_length}</Typography>
                                </TableCell>
                                <TableCell>
                                  <Typography>{path.path}</Typography>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Grid>
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>
            <Accordion>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1a-content"
                id="panel1a-header"
              >
                <Typography>Lab 3.</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container direction={"column"} spacing={2} style={{padding: 10}}>
                  <Grid item>
                    <Button variant="contained" onClick={test}>animate!</Button>
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>
          </Grid>
          <Grid container spacing={2} style={{padding: 10}}>
            <Grid item>
              <Button
                variant="contained"
                component="label"
              >
                Upload graph File
                <input
                  type="file"
                  hidden
                  onChange={e => uploadGraph((e.target.files[0]))}
                />
              </Button>
            </Grid>
            <Grid item>
              <Button variant="contained" onClick={() => copyTextToClipboard(graphToJson())}>Copy graph to clipboard</Button>
            </Grid>
          </Grid>
          {/*table*/}
          <Grid item>
            <TableContainer component={Paper}>
              <Table aria-label="custom pagination table" size="small">
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
                          disabled={true}
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          value={edge.target}
                          variant="outlined"
                          size="small"
                          disabled={true}
                        />
                      </TableCell>
                      {curEdge && curEdge.source === edge.source && curEdge.target === edge.target ?
                        <TableCell>
                          <TextField
                            inputRef={inputEdgeRef}
                            type={"number"}
                            value={edge.handleText}
                            variant="outlined"
                            size="small"
                            onChange={(e) => setEdgeValue(e.target.value, edge.source, edge.target)}
                          />
                        </TableCell>
                        :
                        <TableCell>
                          <TextField
                            type={"number"}
                            value={edge.handleText}
                            variant="outlined"
                            size="small"
                            onChange={(e) => setEdgeValue(e.target.value, edge.source, edge.target)}
                          />
                        </TableCell>
                      }
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
        </Grid>
      </Grid>
    </div>
  );
}
