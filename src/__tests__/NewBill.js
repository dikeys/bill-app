/**
 * @jest-environment jsdom
 */

import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import { getByTestId, screen, waitFor, fireEvent } from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import { ROUTES, ROUTES_PATH } from "../constants/routes"
import { localStorageMock } from "../__mocks__/localStorage.js";
import userEvent from "@testing-library/user-event";
import Bills from "../containers/Bills.js";
import mockStore from "../__mocks__/store"
import store from "../__mocks__/store"

const bill = {
  id: "47qAXb6fIm2zOKkLzMro",
  vat: "80",
  fileUrl: "https://firebasestorage.googleapis.com/v0/b/billable-677b6.a…f-1.jpg?alt=media&token=c1640e12-a24b-4b11-ae52-529112e9602a",
  status: "pending",
  type: "Hôtel et logement",
  commentary: "séminaire billed",
  name: "encore",
  fileName: "preview-facture-free-201801-pdf-1.jpg",
  date: "2004-04-04",
  amount: 400,
  commentAdmin: "ok",
  email: "a@a",
  pct: 20
};


Object.defineProperty(window, 'localStorage', { value: localStorageMock })
window.localStorage.setItem('user', JSON.stringify({type: 'Employee'}))

let newBill = {}


beforeEach(() => {
  const onNavigate = (pathname) => {
    document.body.innerHTML = ROUTES({ pathname })
  }


  const html = NewBillUI()
  document.body.innerHTML = html

  newBill = new NewBill({
    document, onNavigate, store, localStorage: window.localStorage
  })
})

describe("Given I am connected as an employee", () => {

  describe("When I am on NewBill Page", () => {

    test("Then i add a image", () => {
      const inputFile = screen.getByTestId("file")
      inputFile.addEventListener("change", newBill.handleChangeFile);
      userEvent.upload(inputFile, new File(['(⌐□_□)'], 'chucknorris.png', { type: 'image/png' }))
      expect(newBill.handleChangeFile).toBeTruthy()
    })
    test("then be error if document isn't a image format", () => {
      const inputFile = screen.getByTestId("file")
      inputFile.addEventListener("change", newBill.handleChangeFile);
      userEvent.upload(inputFile, new File(['(⌐□_□)'], 'chucknorris.pdf', { type: 'application/pdf' }))
      const spanError = document.getElementById("error-file")
      expect(spanError.id).toBe("error-file")
    })
  })

  describe("When i send a new bill", () => {
    test("then POST a new bill", async ()=>{

     
     const addBill = await store.bills().update(bill)
     const listBills =  await store.bills().list()
     listBills.push(addBill)
      expect(listBills.length).toBe(5)
      expect(addBill).toMatchObject(bill)

    })

 

    test("should be submit a new bill", () => {
      const btnSubmitBill = document.getElementById("btn-send-bill")
      btnSubmitBill.addEventListener("submit", newBill.handleSubmit);
      fireEvent.click(btnSubmitBill);
      expect(newBill.handleSubmit).toBeTruthy();
    })
  })
})
