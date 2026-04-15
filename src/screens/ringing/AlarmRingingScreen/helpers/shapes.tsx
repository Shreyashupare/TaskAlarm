import React from "react";
import { View } from "react-native";

// Simple shape renderers using Views
const CircleShape = () => (
  <View
    style={{
      width: 50,
      height: 50,
      borderRadius: 25,
      backgroundColor: "#fff",
    }}
  />
);

const SquareShape = () => (
  <View
    style={{
      width: 50,
      height: 50,
      borderRadius: 4,
      backgroundColor: "#fff",
    }}
  />
);

const TriangleShape = () => (
  <View
    style={{
      width: 0,
      height: 0,
      backgroundColor: "transparent",
      borderStyle: "solid",
      borderLeftWidth: 25,
      borderRightWidth: 25,
      borderBottomWidth: 50,
      borderLeftColor: "transparent",
      borderRightColor: "transparent",
      borderBottomColor: "#fff",
    }}
  />
);

const StarShape = () => (
  <View
    style={{
      width: 50,
      height: 50,
      justifyContent: "center",
      alignItems: "center",
    }}
  >
    {/* Simple 5-pointed star approximation using views */}
    <View
      style={{
        width: 40,
        height: 40,
        backgroundColor: "#fff",
        transform: [{ rotate: "45deg" }],
        position: "absolute",
      }}
    />
    <View
      style={{
        width: 40,
        height: 40,
        backgroundColor: "#fff",
        transform: [{ rotate: "45deg" }],
        position: "absolute",
        marginTop: -10,
        marginLeft: -10,
      }}
    />
  </View>
);

export function renderShape(
  shape: "circle" | "square" | "triangle" | "star",
  style?: { width: number; height: number }
) {
  const scale = style ? style.width / 50 : 1;

  switch (shape) {
    case "circle":
      return (
        <View
          style={{
            width: 50 * scale,
            height: 50 * scale,
            borderRadius: 25 * scale,
            backgroundColor: "#fff",
          }}
        />
      );
    case "square":
      return (
        <View
          style={{
            width: 50 * scale,
            height: 50 * scale,
            borderRadius: 4 * scale,
            backgroundColor: "#fff",
          }}
        />
      );
    case "triangle":
      return (
        <View
          style={{
            width: 0,
            height: 0,
            backgroundColor: "transparent",
            borderStyle: "solid",
            borderLeftWidth: 25 * scale,
            borderRightWidth: 25 * scale,
            borderBottomWidth: 50 * scale,
            borderLeftColor: "transparent",
            borderRightColor: "transparent",
            borderBottomColor: "#fff",
          }}
        />
      );
    case "star":
      return (
        <View
          style={{
            width: 50 * scale,
            height: 50 * scale,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <View
            style={{
              width: 40 * scale,
              height: 40 * scale,
              backgroundColor: "#fff",
              transform: [{ rotate: "45deg" }],
              position: "absolute",
            }}
          />
        </View>
      );
    default:
      return <CircleShape />;
  }
}
