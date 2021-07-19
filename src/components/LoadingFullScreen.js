import React from "react";

export default function LoadingFullScreen() {
  return (
    <div className="container">
      <div className="mfPlate">
        <div>
          <div className="spinnerHolder">
            <div className="spinner-border" role="status" aria-hidden="true"></div>
          </div>
          <h3>Loading...</h3>
        </div>
      </div>
    </div>
  );
}
