import { useRef, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, OrbitControls, Stage } from "@react-three/drei";
import * as THREE from "three";

interface IvoModelProps {
    open: boolean;
}

function IvoModel({ open }: IvoModelProps) {
    const { scene } = useGLTF("/3d/ivo-t.glb");
    const groupRef = useRef<THREE.Group>(null);
    const [isTabVisible, setIsTabVisible] = useState(!document.hidden);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    useEffect(() => {
        const handleVisibilityChange = () => setIsTabVisible(!document.hidden);
        const handleResize = () => setIsMobile(window.innerWidth <= 768);

        document.addEventListener("visibilitychange", handleVisibilityChange);
        window.addEventListener("resize", handleResize);

        return () => {
            document.removeEventListener("visibilitychange", handleVisibilityChange);
            window.removeEventListener("resize", handleResize);
        };
    }, []);

    useFrame((state) => {
        if (!groupRef.current || !isTabVisible || open) return;

        const t = state.clock.getElapsedTime();
        // Desktop: amplitude 0.03, speed 1.2
        // Mobile: amplitude 0.02, speed 0.8
        const amplitude = isMobile ? 0.02 : 0.03;
        const speed = isMobile ? 0.8 : 1.2;

        groupRef.current.position.y = Math.sin(t * speed) * amplitude;
    });

    // Reset position when chat opens or tab hidden
    useEffect(() => {
        if ((open || !isTabVisible) && groupRef.current) {
            groupRef.current.position.y = 0;
        }
    }, [open, isTabVisible]);

    return (
        <group ref={groupRef}>
            <primitive object={scene} />
        </group>
    );
}

interface IvoT3DProps {
    open?: boolean;
}

export default function IvoT3D({ open = false }: IvoT3DProps) {
    const [isTabVisible, setIsTabVisible] = useState(!document.hidden);

    useEffect(() => {
        const handleVisibilityChange = () => setIsTabVisible(!document.hidden);
        document.addEventListener("visibilitychange", handleVisibilityChange);
        return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
    }, []);

    return (
        <div style={{ width: '100%', height: '100%' }}>
            <Canvas shadows dpr={[1, 2]} camera={{ fov: 50 }}>
                <Stage environment="city" intensity={0.6}>
                    <IvoModel open={open} />
                </Stage>
                <OrbitControls
                    enableZoom={false}
                    autoRotate={isTabVisible && !open}
                    autoRotateSpeed={5}
                    enablePan={false}
                />
            </Canvas>
        </div>
    );
}

useGLTF.preload("/3d/ivo-t.glb");
