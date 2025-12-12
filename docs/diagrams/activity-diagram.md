# Activity Diagrams

Activity diagrams show the workflow and business processes in the Smart Parking Management System.

## 1. User Registration and Login Process

```mermaid
flowchart TD
    Start([User Visits Website]) --> CheckAuth{Already<br/>Logged In?}
    CheckAuth -->|Yes| Dashboard[Go to Dashboard]
    CheckAuth -->|No| Choice{New User?}
    
    Choice -->|Yes| RegForm[Fill Registration Form]
    Choice -->|No| LoginForm[Fill Login Form]
    
    RegForm --> ValidateReg{Valid<br/>Input?}
    ValidateReg -->|No| RegError[Show Error Message]
    RegError --> RegForm
    ValidateReg -->|Yes| CheckEmail{Email<br/>Exists?}
    
    CheckEmail -->|Yes| EmailError[Show 'Email Already Registered']
    EmailError --> RegForm
    CheckEmail -->|No| HashPass[Hash Password]
    HashPass --> CreateUser[Create User in Database]
    CreateUser --> GenToken[Generate JWT Token]
    GenToken --> StoreToken[Store Token in LocalStorage]
    StoreToken --> Dashboard
    
    LoginForm --> ValidateLogin{Valid<br/>Input?}
    ValidateLogin -->|No| LoginError[Show Error Message]
    LoginError --> LoginForm
    ValidateLogin -->|Yes| FindUser{User<br/>Exists?}
    
    FindUser -->|No| CredError[Show 'Invalid Credentials']
    CredError --> LoginForm
    FindUser -->|Yes| ComparePass{Password<br/>Match?}
    
    ComparePass -->|No| CredError
    ComparePass -->|Yes| GenToken
    
    Dashboard --> End([End])
```

## 2. Parking Lot Reservation Process

```mermaid
flowchart TD
    Start([User Logged In]) --> ViewLots[View Available Parking Lots]
    ViewLots --> FetchLots[Fetch Lots from API]
    FetchLots --> DisplayLots[Display Lots with Availability]
    
    DisplayLots --> SelectLot{User Selects<br/>Parking Lot}
    SelectLot --> CheckAvail{Slots<br/>Available?}
    
    CheckAvail -->|No| NoSlots[Show 'No Slots Available']
    NoSlots --> DisplayLots
    
    CheckAvail -->|Yes| ReserveForm[Fill Reservation Form]
    ReserveForm --> EnterDetails[Enter Start/End Time<br/>Select Slot Number]
    EnterDetails --> ValidateTime{Valid<br/>Time Range?}
    
    ValidateTime -->|No| TimeError[Show Error Message]
    TimeError --> ReserveForm
    
    ValidateTime -->|Yes| SubmitReserve[Submit Reservation]
    SubmitReserve --> BeginTrans[Begin Database Transaction]
    BeginTrans --> LockRow[Lock Parking Lot Row]
    LockRow --> RecheckAvail{Still<br/>Available?}
    
    RecheckAvail -->|No| Rollback[Rollback Transaction]
    Rollback --> ConcurrError[Show 'Slot Just Taken']
    ConcurrError --> DisplayLots
    
    RecheckAvail -->|Yes| DecrementSlot[Decrement Available Slots]
    DecrementSlot --> CreateReserve[Create Reservation Record]
    CreateReserve --> Commit[Commit Transaction]
    Commit --> ShowConfirm[Show Confirmation]
    ShowConfirm --> GenQR[Generate QR Code]
    GenQR --> DisplayReserve[Display Reservation Details]
    
    DisplayReserve --> End([End])
```

## 3. Payment Processing Workflow

```mermaid
flowchart TD
    Start([User Has Reservation]) --> ViewReserve[View My Reservations]
    ViewReserve --> FetchReserve[Fetch User Reservations]
    FetchReserve --> DisplayReserve[Display Reservation List]
    
    DisplayReserve --> SelectReserve{Select<br/>Reservation}
    SelectReserve --> CheckStatus{Status<br/>= Booked?}
    
    CheckStatus -->|No| StatusError[Show 'Cannot Pay']
    StatusError --> DisplayReserve
    
    CheckStatus -->|Yes| PaymentPage[Navigate to Payment Page]
    PaymentPage --> CalcAmount[Calculate Amount<br/>Based on Duration]
    CalcAmount --> DisplayAmount[Display Amount to Pay]
    
    DisplayAmount --> SelectMethod{Select<br/>Payment Method}
    SelectMethod --> MobileMoney[Mobile Money]
    SelectMethod --> CreditCard[Credit Card]
    SelectMethod --> Cash[Cash]
    
    MobileMoney --> EnterPhone[Enter Phone Number]
    CreditCard --> EnterCard[Enter Card Details]
    Cash --> ConfirmCash[Confirm Cash Payment]
    
    EnterPhone --> ValidatePhone{Valid<br/>Phone?}
    ValidatePhone -->|No| PhoneError[Show Error]
    PhoneError --> EnterPhone
    ValidatePhone -->|Yes| ProcessPayment
    
    EnterCard --> ValidateCard{Valid<br/>Card?}
    ValidateCard -->|No| CardError[Show Error]
    CardError --> EnterCard
    ValidateCard -->|Yes| ProcessPayment
    
    ConfirmCash --> ProcessPayment[Process Payment]
    
    ProcessPayment --> CreatePayment[Create Payment Record]
    CreatePayment --> GenTransCode[Generate Transaction Code]
    GenTransCode --> MarkPaid[Mark Payment as Paid]
    MarkPaid --> UpdateReserve[Update Reservation Status]
    UpdateReserve --> GenReceipt[Generate Receipt]
    GenReceipt --> GenQR[Generate QR Code]
    GenQR --> DisplayReceipt[Display Receipt]
    
    DisplayReceipt --> DownloadOption{Download<br/>Receipt?}
    DownloadOption -->|Yes| Download[Download PDF/Image]
    DownloadOption -->|No| Done
    Download --> Done([End])
```

## 4. Admin - Manage Parking Lots

```mermaid
flowchart TD
    Start([Admin Logged In]) --> AdminDash[Admin Dashboard]
    AdminDash --> ManageLots[Navigate to Manage Lots]
    ManageLots --> FetchLots[Fetch All Parking Lots]
    FetchLots --> DisplayLots[Display Lots Table]
    
    DisplayLots --> Action{Admin<br/>Action}
    
    Action --> Create[Create New Lot]
    Action --> Edit[Edit Existing Lot]
    Action --> Delete[Delete Lot]
    Action --> View[View Details]
    
    Create --> CreateForm[Fill Create Form]
    CreateForm --> EnterDetails[Enter Name, Location<br/>Total Slots]
    EnterDetails --> ValidateCreate{Valid<br/>Input?}
    ValidateCreate -->|No| CreateError[Show Error]
    CreateError --> CreateForm
    ValidateCreate -->|Yes| SubmitCreate[Submit to API]
    SubmitCreate --> InsertDB[Insert into Database]
    InsertDB --> RefreshList
    
    Edit --> EditForm[Fill Edit Form]
    EditForm --> ModifyDetails[Modify Name, Location<br/>or Slots]
    ModifyDetails --> ValidateEdit{Valid<br/>Input?}
    ValidateEdit -->|No| EditError[Show Error]
    EditError --> EditForm
    ValidateEdit -->|Yes| SubmitEdit[Submit Update]
    SubmitEdit --> UpdateDB[Update Database]
    UpdateDB --> RefreshList
    
    Delete --> ConfirmDelete{Confirm<br/>Delete?}
    ConfirmDelete -->|No| DisplayLots
    ConfirmDelete -->|Yes| CheckReserve{Has Active<br/>Reservations?}
    CheckReserve -->|Yes| DeleteError[Show 'Cannot Delete']
    DeleteError --> DisplayLots
    CheckReserve -->|No| DeleteDB[Delete from Database]
    DeleteDB --> RefreshList
    
    View --> ShowDetails[Show Lot Details]
    ShowDetails --> ShowStats[Show Statistics<br/>Reservations, Revenue]
    ShowStats --> DisplayLots
    
    RefreshList[Refresh Lot List] --> DisplayLots
    
    DisplayLots --> End([End])
```

## 5. Admin - View Reports and Analytics

```mermaid
flowchart TD
    Start([Admin Logged In]) --> AdminDash[Admin Dashboard]
    AdminDash --> Reports[Navigate to Reports]
    Reports --> SelectReport{Select<br/>Report Type}
    
    SelectReport --> Daily[Daily Revenue]
    SelectReport --> ByLot[Revenue by Lot]
    SelectReport --> Reservations[Reservation Stats]
    SelectReport --> Usage[Usage Analytics]
    
    Daily --> SelectDate[Select Date]
    SelectDate --> FetchDaily[Fetch Daily Data]
    FetchDaily --> CalcDaily[Calculate Total Revenue]
    CalcDaily --> DisplayDaily[Display Daily Report]
    DisplayDaily --> ShowChart1[Show Revenue Chart]
    
    ByLot --> SelectDateRange[Select Date Range]
    SelectDateRange --> FetchByLot[Fetch Revenue by Lot]
    FetchByLot --> GroupByLot[Group by Parking Lot]
    GroupByLot --> DisplayByLot[Display Lot Report]
    DisplayByLot --> ShowChart2[Show Bar Chart]
    
    Reservations --> FetchReserve[Fetch All Reservations]
    FetchReserve --> CountStatus[Count by Status]
    CountStatus --> DisplayReserve[Display Reservation Stats]
    DisplayReserve --> ShowChart3[Show Pie Chart]
    
    Usage --> FetchUsage[Fetch Usage Data]
    FetchUsage --> CalcOccupancy[Calculate Occupancy Rate]
    CalcOccupancy --> DisplayUsage[Display Usage Report]
    DisplayUsage --> ShowChart4[Show Line Chart]
    
    ShowChart1 --> ExportOption
    ShowChart2 --> ExportOption
    ShowChart3 --> ExportOption
    ShowChart4 --> ExportOption
    
    ExportOption{Export<br/>Report?}
    ExportOption -->|Yes| ExportPDF[Export as PDF/Excel]
    ExportOption -->|No| Done
    ExportPDF --> Done([End])
```

## 6. Reservation Cancellation Process

```mermaid
flowchart TD
    Start([User Views Reservations]) --> FetchReserve[Fetch My Reservations]
    FetchReserve --> DisplayList[Display Reservation List]
    DisplayList --> SelectReserve{Select<br/>Reservation}
    
    SelectReserve --> CheckStatus{Status =<br/>Booked or Active?}
    CheckStatus -->|No| CannotCancel[Show 'Cannot Cancel']
    CannotCancel --> DisplayList
    
    CheckStatus -->|Yes| ConfirmCancel{Confirm<br/>Cancellation?}
    ConfirmCancel -->|No| DisplayList
    
    ConfirmCancel -->|Yes| BeginTrans[Begin Transaction]
    BeginTrans --> LockReserve[Lock Reservation Row]
    LockReserve --> CheckPayment{Payment<br/>Made?}
    
    CheckPayment -->|Yes| CalcRefund[Calculate Refund Amount]
    CalcRefund --> ProcessRefund[Process Refund]
    ProcessRefund --> UpdateStatus
    
    CheckPayment -->|No| UpdateStatus[Update Status to Cancelled]
    UpdateStatus --> IncrementSlot[Increment Available Slots]
    IncrementSlot --> Commit[Commit Transaction]
    Commit --> SendNotif[Send Cancellation Email]
    SendNotif --> ShowConfirm[Show Confirmation]
    ShowConfirm --> RefreshList[Refresh Reservation List]
    
    RefreshList --> End([End])
```

## Key Process Insights

### Concurrency Handling

The reservation process uses **database transactions with row-level locking** to prevent race conditions:

1. **BEGIN TRANSACTION**: Start atomic operation
2. **SELECT ... FOR UPDATE**: Lock the parking lot row
3. **Check availability**: Verify slots are still available
4. **Update slots**: Decrement available_slots
5. **Create reservation**: Insert reservation record
6. **COMMIT**: Make changes permanent

This ensures that two users cannot book the same last slot simultaneously.

### Error Handling

All processes include comprehensive error handling:

- **Validation Errors**: Input validation before processing
- **Business Logic Errors**: Check business rules (e.g., slot availability)
- **Database Errors**: Handle transaction failures with rollback
- **User Feedback**: Clear error messages for all failure scenarios

### State Management

Reservation states:
- **booked**: Initial state after creation
- **active**: User has checked in
- **completed**: Parking session finished
- **cancelled**: User or admin cancelled

Payment states:
- **pending**: Payment initiated
- **paid**: Payment successful
- **failed**: Payment failed
- **refunded**: Payment refunded after cancellation

---

**Note**: These activity diagrams represent the core business processes. Each process includes proper error handling, validation, and user feedback mechanisms.
