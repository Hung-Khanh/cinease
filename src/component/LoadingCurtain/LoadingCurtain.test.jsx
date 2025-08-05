import React from "react";
import { render, screen, act } from "@testing-library/react";
import LoadingCurtain from "./LoadingCurtain";

jest.useFakeTimers();

describe("LoadingCurtain", () => {
    afterEach(() => {
        jest.clearAllTimers();
    });

    it("renders curtain and logo when loading", () => {
        const { container } = render(<LoadingCurtain isLoading={true} />);
        expect(screen.getByText("CINEASE")).toBeInTheDocument();
        expect(container.querySelector('.loading-curtain-container')).toBeTruthy();
        expect(container.querySelector('.curtain-left')).toBeTruthy();
        expect(container.querySelector('.curtain-right')).toBeTruthy();
    });

    it("starts opening animation and hides after loading", () => {
        const onAnimationComplete = jest.fn();
        const { rerender } = render(
            <LoadingCurtain isLoading={true} onAnimationComplete={onAnimationComplete} />
        );
        // Still visible while loading
        expect(screen.getByText("CINEASE")).toBeInTheDocument();
        // Switch to not loading
        rerender(<LoadingCurtain isLoading={false} onAnimationComplete={onAnimationComplete} />);
        // Animation starts
        expect(screen.getByText("CINEASE")).toBeInTheDocument();
        // Fast-forward timer
        act(() => {
            jest.advanceTimersByTime(1500);
        });
        // Should be hidden
        expect(screen.queryByText("CINEASE")).toBeNull();
        expect(onAnimationComplete).toHaveBeenCalled();
    });

    it("does not call onAnimationComplete if not provided", () => {
        const { rerender } = render(<LoadingCurtain isLoading={true} />);
        rerender(<LoadingCurtain isLoading={false} />);
        act(() => {
            jest.advanceTimersByTime(1500);
        });
        // Should be hidden
        expect(screen.queryByText("CINEASE")).toBeNull();
    });
});

// Add getByClass helper for className selection
// Removed getByClass custom matcher, use container.querySelector instead
