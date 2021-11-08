import React from "react";

export const NODE_KEY = "id";

export const CUSTOM_EMPTY_TYPE = "customEmpty";
export const POLY_TYPE = "poly";
export const EMPTY_EDGE_TYPE = "emptyEdge";
export const RED_EMPTY_EDGE_TYPE = "redEdge";

export const nodeTypes = [
  CUSTOM_EMPTY_TYPE,
  POLY_TYPE,
];
export const edgeTypes = [EMPTY_EDGE_TYPE, RED_EMPTY_EDGE_TYPE];


const CustomEmptyShape = (
  <symbol viewBox="0 0 200 200" id="customEmpty">
    <circle cx="100" cy="100" r="50"  />
  </symbol>
);

const PolyShape = (
  <symbol viewBox="0 0 88 72" id="poly" width="88" height="88">
    <path d="M 0 36 18 0 70 0 88 36 70 72 18 72Z" />
  </symbol>
);

const EmptyEdgeShape = (
  <symbol viewBox="0 0 50 50" id="emptyEdge">
    <circle cx="25" cy="25" r="17" fill="currentColor" />
  </symbol>
);

const RedEmptyEdgeShape = (
    <symbol viewBox="0 0 50 50" id="redEdge">
      <circle cx="25" cy="25" r="17" />
    </symbol>
);


export default {
  EdgeTypes: {
    emptyEdge: {
      shape: EmptyEdgeShape,
      shapeId: "#emptyEdge",
      typeText: "Empty"
    },
    redEdge: {
      shape: RedEmptyEdgeShape,
      shapeId: "#redEdge",
      typeText: "Empty"
    }
  },
  NodeSubtypes: {},
  NodeTypes: {
    customEmpty: {
      shape: CustomEmptyShape,
      shapeId: "#customEmpty",
      typeText: "Node"
    },
    poly: {
      shape: PolyShape,
      shapeId: "#poly",
      typeText: "Poly"
    }
  }
};
