import React, { useState, useEffect } from "react";
import TextChip from "../Common/TextChip";
import { useTranslation } from "react-i18next";
import { getRequest } from "../../services";

const UserMetaParent = ({ userId }) => {
  const [childData, setChildData] = useState(null);
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language;

  useEffect(() => {
    const fetchChildData = async () => {
      try {
        const response = await getRequest(`/api/Parent/${userId}`);
        setChildData(response.data.data);
      } catch (error) {
        console.error("Error fetching child data:", error);
      }
    };

    fetchChildData();
  }, [userId]);

  return (
    <div className="w-100 d-flex flex-column gap-3 userClassMeta px-3 mt-4">
      {childData?.childerns?.map((child) => (
        <div key={child.id} className={`d-flex justify-content-between align-items-center ${isArabic === "sa" ? 'flex-row-reverse' : ''}`}>
          <div className={`d-flex gap-2 align-items-center ${isArabic === "sa" ? 'flex-row-reverse' : ''}`}>
            <img 
              src={child.profilePicture} 
              alt={child.name}
              className="rounded"
              style={{width: "40px", height: "40px", objectFit: "cover"}}
            />
            <div className="d-flex flex-column">
              <h6 className="m-0 p-0 fw-bold">{child.name}</h6>
              <p className="m-0 p-0 text-secondary">
                {child.assignedClass?.className} - {child.assignedClass?.sectionName}
              </p>
            </div>
          </div>
          <TextChip 
            label={`${child.assignedClass?.subjects?.length || 0} subjects`} 
            bg="#EDE7FF" 
            text="#7F53FE" 
          />
        </div>
      ))}
    </div>
  );
};

export default UserMetaParent;
