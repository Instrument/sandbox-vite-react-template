import { useEffect, useState } from "react";
import { Link, useRoutes } from "react-router-dom";

function Home() {
  const [routes, setRoutes] = useState([]);

  useEffect(() => {
    // Since React Router doesn't have a direct getRoutes() equivalent,
    // we'll need to define our routes manually
    const availableRoutes = [
      {
        path: "/snake",
        name: "Snake Game",
        title: "Snake Game",
        date: "2024-03-21", // You can adjust these values
        description: "Classic Snake game implementation",
        new: true,
      },
      {
        path: "/spirograph",
        name: "Spirograph",
        title: "Spirograph",
        date: "2025-01-07",
        description: "Spirographing like it's 1965",
        new: true,
      },
      // Add more routes as needed
    ];

    setRoutes(availableRoutes);
  }, []);

  return (
    <div className="route-index">
      <div className="route-container">
        {routes.map((route, index) => (
          <div key={index} className="m-6 mt-10 flex flex-col gap-2">
            <hr className="border border-gray-200" />
            <div className="header mt-2 flex items-center justify-between">
              <p>{route.date}</p>
              {route.new && (
                <div className="inline-block rounded-md bg-gray-400 px-1 py-0 text-white">
                  NEW
                </div>
              )}
            </div>
            <h3>{route.title || route.name}</h3>
            <p>{route.description}</p>
            <Link to={route.path} className="route-item">
              <button className="mt-4">Visit Link</button>
            </Link>
          </div>
        ))}
      </div>

      <style jsx>{`
        .route-index {
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }
      `}</style>
    </div>
  );
}

export default Home;
