> **Pommy** **Foods** **–** **Final** **Project** **Requirements**
> **(Pommy** **Digital** **Distribution** **System)**

**1.** **Core** **Objectives**

> ● Replace manual ordering (phone calls, invoices) with a **smart**
> **Order** **Management** **System** **(OMS)**.
>
> ● Provide **convenience** **stores** **&** **restaurants** with a
> simple way to:
>
> ○ Place orders, **update** **Pommy** **product** **stock**, and
> auto-generate replenishment orders.
>
> ○ **Admin** **reviews** **&** **approves** (with option to modify
> qty/products) before order is finalized.
>
> ○ Store is notified once the order is confirmed by the admin.
>
> ● Streamline backend workflow (Order Sheet → Kitchen Sheet → Delivery
> Note).
>
> ● Digitize deliveries with a **Driver** **App** (GPS tracking, proof
> of delivery, returns).
>
> ● Ensure **food** **safety** **compliance** with real-time temperature
> monitoring + expired items management.
>
> ● Support **payment** **management** (cash, direct debit into company
> bank account).

**2.** **System** **Components**

**A.** **Order** **Management** **System** **(OMS)**

> ● **Admin** **Dashboard**
>
> ○ Full order control: approve & modify auto-orders before confirming.
>
> ○ Manage stock, pricing, payments, invoices, credit limits.
>
> ○ Auto Generate Kitchen Sheets & Delivery Notes.
>
> ● **Customer** **Portal** **/** **App** **(Stores** **&**
> **Restaurants)**
>
> ○ Log in to browse the catalog & place orders.
>
> ○ Update **Pommy** **product** **stock** **levels** **directly**
> **in** **the** **app**.
>
> ○ View order history, invoices, and payment status.
>
> ● **Replenishment** **Rules** **(New** **Update)**
>
> ○ OMS monitors store-reported stock levels.
>
> ○ When stock \< threshold → OMS generates replenishment order **in**
> **draft** **mode**.
>
> ○ **Admin** **reviews,** **modifies** **(if** **needed),** **and**
> **approves** the order.
>
> ○ Only approved orders move to the Kitchen Sheet & Delivery Note
> stage.

**B.** **Kitchen** **Module**

> ● Auto-generated **Kitchen** **Sheet** (items & qty to prepare/pack).
>
> ● Batch & expiry-date tracking.
>
> ● Barcode/QR labeling for packed items.

**C.** **Delivery** **Management**

> ● Auto-generated Delivery Note linked to Driver App.
>
> ● Delivery scheduling & route optimization.
>
> **Sale** **Returns** **(New)**:
>
> ● Driver collects expired/unsold Pommy meals.
>
> ● Expired items are logged into the Driver App.
>
> ● OMS auto-adjusts current invoice by subtracting returned expired
> items.
>
> ● Only **unsold** **expired** **items** are accepted (not unsold
> active stock).
>
> ● Return data stored for analysis (to track wastage by product/store).

**D.** **Driver** **Mobile** **App**

> ● Assigned orders list (from OMS).
>
> ● GPS tracking & route guidance.
>
> ● Proof of Delivery (e-signature or photo).
>
> **Temperature** **Logging** (manual entry or IoT sensor integration).
>
> **Return** **Handling**:
>
> ● Scan/enter returned expired items.
>
> ● App syncs returns with OMS → invoice adjusted automatically.
>
> **Payment** **Collection**:
>
> ● Mark if payment was **cash** **to** **the** **driver** or **direct**
> **debit**.
>
> ● Driver uploads proof of cash collection (receipt/photo).

**E.** **Temperature** **&** **Compliance**

> ● **Manual** **entry** → driver records temp at delivery.
>
> ● **IoT** **sensor** **integration** → fridge/freezer auto-sends
> readings.
>
> ● Data stored in OMS for food safety audits.

**F.** **Payments** **&** **Invoicing**

> ● Auto-generate invoice after delivery.
>
> ● Store/ Store owner account creation and statistics of payments
> (status, new order invoice, due date etc.).
>
> **Payment** **Modes:**
>
> ● **Cash** **on** **Delivery** → driver collects & logs in app.
>
> ● **Direct** **Debit** **/** **Online** **Payment** → processed via
> bank/payment gateway.
>
> ● **Credit** **management** → track overdue accounts, send reminders.
> Auto-invoice after delivery.
>
> ● If possible, local bank integration for receiving payments into
> company accounts.

**G.** **Analytics** **&** **Reporting**

> ● Sales reports (per store, product, region).
>
> ● **Stock** **insights** → track how each store manages Pommy
> products.
>
> ● Delivery performance metrics.

**H.** **Analytics** **&** **Reporting**

> ● Sales reports (by product, store, region).
>
> ● **Return/Wastage** **reports** → which meals expire most, at which
> stores.
>
> ● Payment collection reports (cash vs direct debit).
>
> ● Delivery performance metrics (on-time %, route efficiency).

**3.** **Workflow** **(Digitalized** **&** **Enhanced)**

> 1\. **Store** **Stock** **Update** → Store updates Pommy product
> stock.
>
> 2\. **Replenishment** **Trigger** → OMS generates draft order when
> stock \< threshold.
>
> 3\. **Admin** **Approval** → Admin modifies/approves order.
>
> 4\. **OMS** **Processing** → Kitchen Sheet + Delivery Note generated.
>
> 5\. **Kitchen** **Prep** → Staff packs & labels items.
>
> 6\. **Delivery** **Execution** → Driver app guides deliveries, records
> temp, collects cash.
>
> 7\. **Returns** → Driver logs expired unsold items, OMS auto-adjusts
> invoice.
>
> 8\. **Payment** **Settlement** → Invoice finalized (cash collected or
> direct debit applied).
>
> 9\. **Analytics** → Sales, returns, payments, wastage tracked in OMS.
