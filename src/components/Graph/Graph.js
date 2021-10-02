import {GraphView} from "react-digraph";

import React, {useEffect, useRef, useState} from "react";

import {Grid, TextField} from "@material-ui/core";

import "./Graph.css";
import {default as nodeConfig} from "./config";

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
  const [curNodeValue, setCurNodeValue] = useState('0');
  const [curEdgeValue, setCurEdgeValue] = useState('0');
  const [nextNodeId, setNextNodeId] = useState(1);
  const [curNode, setCurNode] = useState(null);
  const [curEdge, setCurEdge] = useState(null);
  const [selected, setSelected] = useState({nodes: null, edges: null});
  const inputEdgeRef = React.useRef();
  const inputNodeRef = React.useRef();

  useEffect(() => {
    if (selected.nodes) {
      const node = selected.nodes.values().next();
      setCurNode(node);
      setCurEdge(null);
    } else if (selected.edges) {
      const edge = selected.edges.values().next();
      setCurEdge(edge);
      setCurNode(null);
    } else {
      setCurNode(null);
      setCurEdge(null);
    }
  }, [selected])

  useEffect(() => {
    if (curEdge) {
      setCurEdgeValue(curEdge.value.handleText ? curEdge.value.handleText: "0");
      // inputEdgeRef.current.focus();
    } else {
      setCurEdgeValue("")
    }
  }, [curEdge])

  useEffect(() => {
    if (curNode) {
      setCurNodeValue(curNode.value.title ? curNode.value.title: curNode.value.id);
      // inputNodeRef.current.focus();
    } else {
      setCurNodeValue("")
    }
  }, [curNode])

  useEffect(() => {
    if (curEdge) {
      const idx = edges.indexOf(curEdge.value);
      let newEdges = [...edges];
      newEdges[idx].handleText = "" + parseInt(curEdgeValue);
      setEdges(newEdges);
    }
  }, [curEdgeValue])

  useEffect(() => {
    if (curNode) {
      const idx = nodes.indexOf(curNode.value);
      let newNodes = [...nodes];
      newNodes[idx].title = curNodeValue;
      setNodes(newNodes)
    }
  }, [curNodeValue])
  const myRef = useRef("someval?");

  const NodeTypes = GraphConfig.NodeTypes;
  const NodeSubtypes = GraphConfig.NodeSubtypes;
  const EdgeTypes = GraphConfig.EdgeTypes;

  function onCreateEdge(src, tgt) {
    const newEdge = {
      source: src.id,
      target: tgt.id,
      type: "specialEdge",
      handleText: "0"
    };

    setEdges((prev) => [...prev, newEdge]);
    let edges = new Map();
    edges.set(`${newEdge.source}_${newEdge.target}`, newEdge)
    setSelected({nodes: null, edges: edges})
    inputEdgeRef.current.focus();
  }

  function onCreateNodeClick(x, y) {
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
    setSelected(selected);
  }
  function onDeleteNode(viewNode) {
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
    if (e.nodes) {
      onDeleteNode(e.nodes.values().next().value)
    } else if (e.edges) {
      onDeleteEdge(e.edges.values().next().value)
    }
  }
  function onDeleteEdge(edge) {
    const index = edges.indexOf(edge);
    if (index > -1) {
      let newEdges = [...edges]
      newEdges.splice(index, 1)
      setEdges(newEdges);
    }
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
        <Grid item xs={2}>
          <Grid container direction="column" spacing={1}>
            {selected.nodes &&
              <Grid item>
                <TextField
                  id="node_edit_val"
                  label="Node name"
                  variant="outlined"
                  disabled={!selected.nodes}
                  inputRef={inputNodeRef}
                  value={curNodeValue}
                  onChange={(e) => setCurNodeValue(e.target.value)}
                />
              </Grid>
            }
            {selected.edges &&
              <Grid item>
                <TextField
                  id="edge_edit_val"
                  label="Edge value"
                  variant="outlined"
                  type={"number"}
                  disabled={!selected.edges}
                  inputRef={inputEdgeRef}
                  value={curEdgeValue}
                  onChange={(e) => setCurEdgeValue(e.target.value)}
                />
              </Grid>
            }
            {!selected.nodes && !selected.edges &&
              <p>Select edge or node for editing</p>
            }
          </Grid>
        </Grid>

        <Grid item xs={10}>
          <div
            style={{
              height: "70vh",
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
      </Grid>
    </div>
  );
}
