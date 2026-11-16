import { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { Camera } from "expo-camera";
import { PoseCameraView, getImageJointAngle } from "expo-mediapipe-pose";

export default function PoseScreen() {
  const [granted, setGranted] = useState(false);

  useEffect(() => {
    Camera.requestCameraPermissionsAsync().then(r => setGranted(r.granted));
  }, []);

  if (!granted) {
    return (
      <View style={{ flex: 1, justifyContent: "center" }}>
        <Text>Camera permission needed</Text>
      </View>
    );
  }

  return (
    <PoseCameraView
      style={{ flex: 1 }}
      cameraFacing="front"
      frameLimit={15}
      callbackFps={10}
      onLandmark={frame => {
        const k = getImageJointAngle(
          { landmarks: frame.landmarks, imageSize: frame.additionalData },
          "leftHip", "leftKnee", "leftAnkle",
        );
        if (k.status === "available") console.log("knee", Math.round(k.value));
      }}
      onInferenceError={e => console.warn("pose error", e.code)}
    />
  );
}