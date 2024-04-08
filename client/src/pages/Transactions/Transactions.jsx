import React, { useEffect, useState } from 'react'
import styles from "./Transactions.module.css"
import axios from 'axios'

const Transactions = ({ }) => {
  const [transactions, setTransactions] = useState("");
  const [statistics, setStatistics] = useState("");
  const [month, setMonth] = useState("3");
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const [search, setSearch] = useState("");
  const [totalPages, setTotalPages] = useState(null);
  const [totalCount, setTotalCount] = useState(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_BACKEND_URL_FOR_PRODUCTS}?page=${page}&limit=${limit}`)
      .then(response => {
        console.log(response);
        setTransactions(response.data.savedProducts);
        setTotalPages(response.data.totalPages);
        setTotalCount(response.data.totalCount);
        setPage(response.data.page);
      })
      .catch(error => {
        console.error(error);
      })
  }, [page, limit])

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_BACKEND_URL_FOR_PRODUCTS}/filter_products?search=${search}&month=${month}`)
      .then(response => {
        console.log(response);
        setTransactions(response.data);
      })
      .catch(error => {
        console.error(error);
      })
  }, [month, search])

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_BACKEND_URL_FOR_PRODUCTS}/statistics?month=${month}`)
      .then(response => {
        // console.log(response);
        setStatistics(response.data);
      })
      .catch(error => {
        console.error(error);
      })
  }, [month])

  return (
    <>
      <div className={styles.showAnalytics_container}>
        {transactions && transactions.length > 0 ?
          <>
            <h1>Transaction Dashboard</h1>
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} name="search" placeholder='Search by title,description or price' />
            <select name="months" value={month} onChange={e => setMonth(e.target.value)}>
              {monthNames.map((monthName, index) => (
                <option key={index + 1} value={index + 1}>{monthName}</option>
              ))}
            </select>
            <div>
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Title</th>
                    <th>Description</th>
                    <th>Price</th>
                    <th>Category</th>
                    <th>Sold</th>
                    <th>Date of Sale</th>
                    <th>Image</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions && transactions.map((transaction, index) => {
                    // const createdAtDate = new Date(quiz.createdAt);
                    // const formattedDate = `${String(createdAtDate.getDate()).padStart(2, '0')} ${createdAtDate.toLocaleString('default', { month: 'short' })}, ${String(createdAtDate.getFullYear())}`;
                    return (
                      <tr key={index}>
                        <td>{transaction.id}</td>
                        <td>{transaction.title}</td>
                        <td>{transaction.description}</td>
                        <td>{transaction.price}</td>
                        <td>{transaction.category}</td>
                        <td>{transaction.sold ? "Sold" : "Not Sold"}</td>
                        <td>{new Date(transaction.dateOfSale).toLocaleDateString()}</td>
                        <td>
                          <img src={transaction.image} alt="productImage" className={styles.images} />
                        </td>
                      </tr>
                    );
                  })}



                </tbody>
              </table>
            </div>
            <div className={styles.pagination}>
              <button onClick={() => { setPage(page > 1 ? page - 1 : 1); window.scrollTo(0, 0) }}>Previous</button>
              <button onClick={() => { setPage(page < totalPages ? page + 1 : page); window.scrollTo(0, 0) }}>Next</button>
            </div>
            <div className={styles.info}>
              <p>Total Count: {totalCount}</p>
              <p>Total Pages: {totalPages}</p>
              <p>Current Page: {page}</p>
            </div>
          </>
          : <p>Loading...</p>}


      </div>

      <div style={{ marginLeft: "1.5rem" }}>
        {statistics && statistics.length > 0 ? (
          <>
            <h1>Statistics - {monthNames[month - 1]}</h1>
            <div style={{ backgroundColor: "yellow", width: "20vw", height: "20vh", display: "flex", flexDirection: "column", gap: "1rem", justifyContent: "center", marginTop: "1rem" }}>
              <p>Total sale - {statistics[0].totalSaleAmount}</p>
              <p>Total sold item - {statistics[0].totalSoldItems}</p>
              <p>Total not sold item - {statistics[0].totalNotSoldItems}</p>
            </div>
          </>
        ) : (
          <p>Loading statistics...</p>
        )}
      </div>
    </>
  )
}

export default Transactions
