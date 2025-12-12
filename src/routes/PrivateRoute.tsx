import React, { type JSX } from "react";
import { Navigate } from "react-router-dom";
import { getToken } from "../utils/cookieHelper";

interface PrivateRouteProps {
    children: JSX.Element;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
    const token = getToken();

    if (!token) {
        // User not authenticated — redirect to login
        return <Navigate to="/auth" replace />;
    }

    return children; // User authenticated — render the page
};

export default PrivateRoute;
