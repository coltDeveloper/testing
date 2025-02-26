import React, { useState } from "react";
import { useChild } from "../../ContextAPI/ChildContext";

const ChildCards = () => {
  const { selectedChildId, setSelectedChildId, usersChild } = useChild();
  const [activeIndex, setActiveIndex] = useState(0);

  const handleClick = (index) => {
    setActiveIndex(index);
    setSelectedChildId(usersChild[index].id);
  };

  return (
    <div className="d-flex gap-3 justify-content-start flex-wrap smFlexScreen mt-3">
      {usersChild.map((child, index) => (
        <div
          key={child.id}
          className={` ${
            child.id === selectedChildId ? "childChipActive" : "childChip"
          } d-flex flex-row gap-2 align-items-center cursor-pointer`}
          onClick={() => handleClick(index)}
        >
          <div className="childAvatar">
            <img src={child.profilePicture} alt={child.name} className="h-100 w-100" />
          </div>
          <div className="d-flex flex-column">
            <h6 className={`p-0 m-0 ${child.id === selectedChildId ? "text-white" : ""}`}>
              {child.name}
            </h6>
            <span>{child.class}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ChildCards;
