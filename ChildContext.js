import React, { createContext, useContext, useState, useEffect } from "react";
import { getRequest } from "../services";

const ChildContext = createContext();

export const ChildProvider = ({ children }) => {
  const [selectedChildId, setSelectedChildId] = useState(null);
  const [usersChild, setUsersChild] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const userID = JSON.parse(localStorage.getItem("user"));
        if (!userID) return;

        const response = await getRequest(`/api/Parent/${userID.userId}`);
        const data = response.data.data;
        setUsersChild(data.childerns);

        // Set first child's ID if not already set
        if (data.childerns.length > 0 && !selectedChildId) {
          setSelectedChildId(data.childerns[0].id);
        }
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, []);

  return (
    <ChildContext.Provider value={{ selectedChildId, setSelectedChildId, usersChild }}>
      {children}
    </ChildContext.Provider>
  );
};

export const useChild = () => useContext(ChildContext);
