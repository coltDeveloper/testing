import React, { useState } from "react";
import { Modal, Input, Button, Pagination } from "antd";
import { Plus } from "lucide-react";

const Physical = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentBook, setCurrentBook] = useState(null);
    const [issueDetails, setIssueDetails] = useState({ name: '', dateIssued: '', returnDate: '' });
    const [newBookDetails, setNewBookDetails] = useState({
        title: '',
        author: '',
        category: '',
        publicationDate: '',
        coverImage: null,
        details: ''
    });
    const [isAddBookModalOpen, setIsAddBookModalOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 8;

    const dataBook = [
        {
            coverImage: 'https://img.pikbest.com/origin/09/02/31/51cpIkbEsTn3E.jpg!w700wp',
            title: 'my book',
            issued: false,
            details: null
        },
        {
            coverImage: 'https://img.pikbest.com/origin/09/02/31/51cpIkbEsTn3E.jpg!w700wp',
            title: 'my book 2',
            issued: true,
            details: {
                name: 'John Doe',
                dateIssued: '2023-01-01',
                returnDate: '2023-01-15',
            }
        },
    ];

    const filteredBooks = dataBook.filter(book =>
        book.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleImageClick = (book) => {
        setCurrentBook(book);
        setIsModalOpen(true);
        if (!book.issued) {
            setIssueDetails({ name: '', dateIssued: '', returnDate: '' });
        }
    };

    const handleIssueChange = (e) => {
        const { name, value } = e.target;
        setIssueDetails(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmitIssue = () => {
        console.log("Issuing book to:", issueDetails);
        setIsModalOpen(false);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setIssueDetails({ name: '', dateIssued: '', returnDate: '' });
    };

    const handleAddBook = () => {
        setIsAddBookModalOpen(true);
        setNewBookDetails({
            title: '',
            author: '',
            category: '',
            publicationDate: '',
            coverImage: null,
            details: ''
        });
    };

    const handleNewBookChange = (e) => {
        const { name, value } = e.target;
        setNewBookDetails(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmitNewBook = () => {
        console.log("Adding new book:", newBookDetails);
        setIsAddBookModalOpen(false);
    };

    const totalBooks = filteredBooks.length;
    const paginatedBooks = filteredBooks.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    return (
        <>
            <div className="mb-4 row">
                <div className="col-10">
                    <Input
                        type="text"
                        placeholder="Search by title"
                        className="p-2 border rounded w-full"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="col-2">
                    <div className="flex space-x-2 w-100">
                        <button
                            className="flex items-center justify-center flex-1 bg-[#241763] text-white p-2 rounded space-x-2"
                            onClick={handleAddBook}
                        >
                            <Plus className="h-4 w-4" />
                            <span>Add Book</span>
                        </button>
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {paginatedBooks.map((book, index) => (
                    <div key={index} className="border rounded w-[90%] h-[300px]">
                        <img
                            src={book.coverImage}
                            alt={book.title}
                            className={`w-100 h-100 mb-2 cursor-pointer ${book.issued ? 'opacity-50 bg-black' : ''}`}
                            onClick={() => handleImageClick(book)}
                        />
                    </div>
                ))}
            </div>
            <div className="d-flex justify-content-center">
            <Pagination
                current={currentPage}
                pageSize={pageSize}
                total={totalBooks}
                onChange={(page) => setCurrentPage(page)}
                className="mt-4"
            />
            </div>

            <Modal
                title={currentBook?.issued ? `Details for ${currentBook.title}` : `Issue ${currentBook?.title}`}
                visible={isModalOpen}
                onCancel={handleCloseModal}
                footer={[
                    <Button key="close" onClick={handleCloseModal} className="bg-[#EDEBF1] text-[#463C77]">Close</Button>,
                    !currentBook?.issued && (
                        <Button key="submit" onClick={handleSubmitIssue} className="bg-[#463C77] text-white">Submit</Button>
                    )
                ]}
            >
                {currentBook?.issued ? (
                    <div className="p-3">
                        <p>Issued to: {currentBook.details.name}</p>
                        <p>Date Issued: {currentBook.details.dateIssued}</p>
                        <p>Return Date: {currentBook.details.returnDate}</p>
                    </div>
                ) : (
                    <div className="p-3">
                        <label htmlFor="name" className="block mb-1">Name</label>
                        <Input
                            type="text"
                            name="name"
                            placeholder="Name"
                            value={issueDetails.name}
                            onChange={handleIssueChange}
                            className="p-2 border rounded w-full mb-2"
                        />
                        <label htmlFor="dateIssued" className="block mb-1">Date Issued</label>
                        <Input
                            type="date"
                            name="dateIssued"
                            value={issueDetails.dateIssued}
                            onChange={handleIssueChange}
                            className="p-2 border rounded w-full mb-2"
                        />
                        <label htmlFor="returnDate" className="block mb-1">Return Date</label>
                        <Input
                            type="date"
                            name="returnDate"
                            value={issueDetails.returnDate}
                            onChange={handleIssueChange}
                            className="p-2 border rounded w-full mb-2"
                        />
                    </div>
                )}
            </Modal>

            <Modal
                title="Add New Book"
                visible={isAddBookModalOpen}
                onCancel={() => setIsAddBookModalOpen(false)}
                footer={[
                    <Button key="close" onClick={() => setIsAddBookModalOpen(false)} className="bg-[#EDEBF1] text-[#463C77]">Close</Button>,
                    <Button key="submit" onClick={handleSubmitNewBook} className="bg-[#463C77] text-white">Submit</Button>
                ]}
            >
                <div className="p-3">
                    <Input
                        type="text"
                        name="title"
                        placeholder="Title"
                        value={newBookDetails.title}
                        onChange={handleNewBookChange}
                        className="p-2 border rounded w-full mb-2"
                    />
                    <Input
                        type="text"
                        name="author"
                        placeholder="Author"
                        value={newBookDetails.author}
                        onChange={handleNewBookChange}
                        className="p-2 border rounded w-full mb-2"
                    />
                    <Input
                        type="text"
                        name="category"
                        placeholder="Category"
                        value={newBookDetails.category}
                        onChange={handleNewBookChange}
                        className="p-2 border rounded w-full mb-2"
                    />
                    <Input
                        type="date"
                        name="publicationDate"
                        value={newBookDetails.publicationDate}
                        onChange={handleNewBookChange}
                        className="p-2 border rounded w-full mb-2"
                    />
                    <Input
                        type="file"
                        name="coverImage"
                        onChange={(e) => setNewBookDetails(prev => ({ ...prev, coverImage: e.target.files[0] }))}
                        className="p-2 border rounded w-full mb-2"
                    />
                    <Input
                        type="text"
                        name="details"
                        placeholder="Details"
                        value={newBookDetails.details}
                        onChange={handleNewBookChange}
                        className="p-2 border rounded w-full mb-2"
                    />
                </div>
            </Modal>
        </>
    );
}

export default Physical;