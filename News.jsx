import React, { useState, useEffect } from "react";

const App = () => {

    const dummyData =[
        {
            "_id": "67dd8faa8bf18ea0653486c7",
            "title": "My First Post ",
            "date": "2025-03-20T19:00:00.000Z",
            "description": "This is my first blog post. It covers the basics of blogging and how to get started. You will learn about the importance of content and engagement. Additionally, we will explore various platforms available for blogging. This post aims to inspire new bloggers to share their thoughts. Join me on this journey of creativity and expression.",
            "images": [
                "https://lms-api.wiserbee.ca/Upload/Documents/57d4f138-00b2-42be-a0b4-bc7e9cac8bd7.png"
            ],
            "__v": 0
        },
        {
            "_id": "67dd8fb48bf18ea0653486c9",
            "title": "My Second Post",
            "date": "2025-03-21T12:00:00.000Z",
            "description": "This is my second blog post. In this post, I will discuss the challenges of blogging. It's essential to stay consistent and motivated. I will share tips on how to overcome writer's block. Engaging with your audience is crucial for growth. Let's dive into the world of blogging together!",
            "images": [
                "https://images.unsplash.com/photo-1595147389795-37094173bfd8?q=80&w=2069&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                "https://plus.unsplash.com/premium_photo-1664474619075-644dd191935f?q=80&w=2069&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            ],
            "__v": 0
        },
        {
            "_id": "67ddd0f508e1ce735a5f12bf",
            "title": "Voluptate vitae aut ",
            "date": "2025-03-21T19:00:00.000Z",
            "description": "Voluptate est minim. This post will explore various topics related to lifestyle. We will discuss health, wellness, and personal growth. Each section will provide valuable insights and tips. Readers will find inspiration to improve their daily lives. Join us as we embark on this journey of self-discovery.",
            "images": [
                "https://lms-api.wiserbee.ca/Upload/Documents/192d5345-703f-4406-a8a9-9e4460c45686.jpg",
                "https://lms-api.wiserbee.ca/Upload/Documents/593448c5-6694-40f7-b8a4-02efddee7bbc.png"
            ],
            "__v": 0
        },
        {
            "_id": "67de12cb326681263f012735",
            "title": "kashif",
            "date": "2025-03-20T00:00:00.000Z",
            "description": "wwww. This post will delve into the world of technology. We will cover the latest trends and innovations. Understanding technology is crucial in today's world. I will share my thoughts on future developments. Stay tuned for exciting updates and insights. Let's explore the tech landscape together!",
            "images": [
                "https://lms-api.wiserbee.ca/Upload/Documents/df9ca056-9594-453c-a5e9-8afbc4e2e01f.jpg",
                "https://lms-api.wiserbee.ca/Upload/Documents/05f79b44-1581-45ff-b7dd-e61b5b4c2b15.png"
            ],
            "__v": 0
        }
    ];

    const [selectedNews, setSelectedNews] = useState(0);
    const [selectedImage, setSelectedImage] = useState('image1');
    const [currentPage, setCurrentPage] = useState(1);
    const [newsData, setNewsData] = useState(dummyData); // Use dummyData instead of fetching
    const itemsPerPage = 2;

    // Commented out the fetch function to use dummyData
    /*
    useEffect(() => {
        const fetchNewsData = async () => {
            try {
                const response = await fetch('https://blog-api.wiserbee.ca/api/posts');
                const data = await response.json();
                setNewsData(data);
            } catch (error) {
                console.error("Error fetching news data:", error);
            }
        };

        fetchNewsData();
    }, []);
    */

    const ImageThumbnail = ({ src, index, isSelected, onClick }) => (
        <img
            src={src}
            alt={`thumbnail ${index + 1}`}
            style={{ width: '100px', cursor: 'pointer' }}
            onClick={onClick}
            className={isSelected ? 'border border-primary' : ''}
        />
    );

    const NewsCard = ({ news, index, onClick }) => {
        const truncatedDescription = news.description.split(' ').slice(0, 20).join(' ') + '...';
        return (
            <div key={index} className="card" onClick={onClick} style={{ cursor: 'pointer' }}>
                <div className="card__header">
                    <img src={news.images[0]} alt="card__image" className="card__image" width="600" height='300'/>
                </div>
                <div className="card__body">
                    <span className="tag">News</span>
                    <h4>{news.title}</h4>
                    <p>{truncatedDescription}</p>
                </div>
            </div>
        );
    };

    // Get current news items
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = newsData.slice(indexOfFirstItem, indexOfLastItem);

    // Change page
    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    return (
        <div>
            <h1 className="text-center my-5 fontSize48">News about the wiserbee</h1>
            <div className="row m-3">
                <div className="col-md-8">
                    <div style={{ width: '100%', height: '500px', borderRadius: '10px', border: '3px solid #251963' }}>
                        <img
                            src={newsData[selectedNews]?.images[parseInt(selectedImage.replace('image', '')) - 1]}
                            alt="news"
                            className="img-fluid mb-3 w-100 h-100"
                            style={{ borderRadius: '8px' }}
                        />
                    </div>
                    <div className="d-flex gap-2 mb-3 mt-3" style={{ height: '80px' }}>
                        {newsData[selectedNews]?.images.map((image, index) => (
                            <ImageThumbnail
                                key={index}
                                src={image}
                                index={index}
                                isSelected={selectedImage === `image${index + 1}`}
                                onClick={() => setSelectedImage(`image${index + 1}`)}
                            />
                        ))}
                    </div>
                    <h1 className="mt-3">{newsData[selectedNews]?.title}</h1>
                    <h1 className="mt-3">Date: {new Date(newsData[selectedNews]?.date).toLocaleDateString()}</h1>
                    <p>{newsData[selectedNews]?.description}</p>
                </div>

                <div className="col-md-4">
                    <div className="news" id="news">
                        <div className="titletext">
                            <h1>News <span>Feed</span></h1>
                        </div>
                        <div className="container">
                            {currentItems.map((news, index) => (
                                <NewsCard
                                    key={index}
                                    news={news}
                                    index={indexOfFirstItem + index}
                                    onClick={() => setSelectedNews(indexOfFirstItem + index)}
                                />
                            ))}
                        </div>
                    </div>
                    <div className="d-flex justify-content-center flex-column align-items-center mt-3">
                        <div className="d-flex">
                            <button
                                onClick={() => paginate(currentPage > 1 ? currentPage - 1 : 1)}
                                className="btn btn-outline-primary mx-1"
                                disabled={currentPage === 1}
                            >
                                &lt;
                            </button>
                            {[...Array(Math.ceil(newsData.length / itemsPerPage))].map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => paginate(index + 1)}
                                    className={`btn ${currentPage === index + 1 ? 'btn-primary' : 'btn-outline-primary'} mx-1`}
                                >
                                    {index + 1}
                                </button>
                            ))}
                            <button
                                onClick={() => paginate(currentPage < Math.ceil(newsData.length / itemsPerPage) ? currentPage + 1 : currentPage)}
                                className="btn btn-outline-primary mx-1"
                                disabled={currentPage === Math.ceil(newsData.length / itemsPerPage)}
                            >
                                &gt;
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default App;
