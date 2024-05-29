import { peopleList } from "./customerList";
import { useState, forwardRef } from "react";
import PropTypes from "prop-types";
import { CSS } from "@dnd-kit/utilities";

import {
  closestCenter,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";

// const Item = forwardRef(({id, ...props}, ref) => {
//   return (
//     <div {...props} ref={ref}>{id}</div>
//   )
// });

const SortableItem = ({ customer, onDelete }) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: customer.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <tr ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <td
        style={{
          padding: "12px",
          borderBottom: "1px solid #ddd",
        }}
      >
        {customer.name}
      </td>
      <td
        style={{
          padding: "12px",
          borderBottom: "1px solid #ddd",
        }}
      >
        {customer.company}
      </td>
      <td
        style={{
          padding: "12px",
          borderBottom: "1px solid #ddd",
        }}
      >
        <button
          onClick={() => {
            onDelete(customer.id);
          }}
        >
          삭제
        </button>
      </td>
    </tr>
  );
};

SortableItem.propsTypes = {
  customer: PropTypes.array.isRequired,
  onDelete: PropTypes.func.isRequired,
};

function App() {
  const [customers, setCustomers] = useState(peopleList);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newCustomerName, setNewCustomerName] = useState("");
  const [newCustomerCompany, setNewCustomerCompany] = useState("");
  const [activeId, setActiveId] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleSearchChange = (e) => {
    setSearchKeyword(e.target.value);
  };

  const handleDelete = (id) => {
    setCustomers(customers.filter((customer) => customer.id !== id));
  };

  const handleAdd = () => {
    const newCustomer = {
      id: customers.length > 0 ? customers[customers.length - 1].id + 1 : 1,
      name: newCustomerName,
      company: newCustomerCompany,
    };
    setCustomers([...customers, newCustomer]);
    setIsDialogOpen(false);
    setNewCustomerName("");
    setNewCustomerCompany("");
  };

  const handleDragStart = (event) => {
    const { active } = event;

    setActiveId(active.id);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      console.log("differ");
      setCustomers((customer) => {
        const oldIndex = customer.indexOf(active.id);
        const newIndex = customer.indexOf(over.id);

        return arrayMove(customer, oldIndex, newIndex);
      });
    }

    setActiveId(null);
  };

  const filteredCustomers = customers.filter((customer) =>
    customer.name.includes(searchKeyword)
  );

  return (
    <div>
      <h1>customer list</h1>
      <input
        type="text"
        placeholder="검색어를 입력해주세요"
        value={searchKeyword}
        onChange={handleSearchChange}
      />
      <button
        onClick={() => {
          setIsDialogOpen(true);
        }}
      >
        추가
      </button>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={customers}
          strategy={verticalListSortingStrategy}
        >
          <table>
            <thead>
              <tr>
                <th
                  style={{
                    padding: "12px",
                    borderBottom: "1px solid #ddd",
                    backgroundColor: "#f2f2f2",
                  }}
                >
                  이름
                </th>
                <th
                  style={{
                    padding: "12px",
                    borderBottom: "1px solid #ddd",
                    backgroundColor: "#f2f2f2",
                  }}
                >
                  회사
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.length > 0
                ? filteredCustomers.map((customer) => (
                    <SortableItem
                      key={customer.id}
                      customer={customer}
                      onDelete={handleDelete}
                    />
                  ))
                : "아무 것도 찾지 못했어요"}
            </tbody>
          </table>
        </SortableContext>
        <DragOverlay>{activeId ? <div id={activeId} /> : null}</DragOverlay>
      </DndContext>
      {isDialogOpen && (
        <div
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            padding: "20px",
            backgroundColor: "white",
            boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.1)",
          }}
        >
          <h2>Add New Customer</h2>
          <input
            type="text"
            placeholder="Name"
            value={newCustomerName}
            onChange={(e) => setNewCustomerName(e.target.value)}
            style={{
              padding: "10px",
              fontSize: "16px",
              marginBottom: "10px",
              width: "100%",
            }}
          />
          <input
            type="text"
            placeholder="Company"
            value={newCustomerCompany}
            onChange={(e) => setNewCustomerCompany(e.target.value)}
            style={{
              padding: "10px",
              fontSize: "16px",
              marginBottom: "10px",
              width: "100%",
            }}
          />
          <button
            onClick={handleAdd}
            style={{
              padding: "10px 20px",
              fontSize: "16px",
              marginRight: "10px",
            }}
          >
            Add
          </button>
          <button
            onClick={() => setIsDialogOpen(false)}
            style={{ padding: "10px 20px", fontSize: "16px" }}
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
