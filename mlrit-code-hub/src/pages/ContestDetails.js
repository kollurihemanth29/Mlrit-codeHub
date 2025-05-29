import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, Link } from "react-router-dom";
import "./ContestDetails.css";

const ContestDetails = () => {
  const { id } = useParams();
  const [contest, setContest] = useState(null);

  useEffect(() => {
    const fetchContest = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/contests/${id}`);
        setContest(res.data);
      } catch (error) {
        console.error("Failed to fetch contest", error);
      }
    };

    fetchContest();
  }, [id]);

  return (
    <div className="contest-details">
      {contest ? (
        <>
          <h2>{contest.title}</h2>
          <p>{contest.description}</p>
          <h3>Problems:</h3>
          <ul>
            {contest.problems.map((problem) => (
              <li key={problem._id}>
                <Link to={`/contest/${contest._id}/problem/${problem._id}`}>
                  {problem.title}
                </Link>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <p>Loading contest...</p>
      )}
    </div>
  );
};

export default ContestDetails;
