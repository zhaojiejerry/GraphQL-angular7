import { Component, OnInit } from "@angular/core";
import { Apollo } from "apollo-angular";
import gql from "graphql-tag";
import { Observable } from "rxjs";
import { map } from 'rxjs/operators';

class Order {
  constructor(
    public id: number = null ,
    public Name: string = "",
    public UserId: number=null,
    public CreateDate: string = "",
    public Price: number=null ,
    public Number: number=null,
    public TotalAmount: number=null ,
    public OrderRating: string = ""
  ) {}
}

@Component({
  selector: "app-order",
  templateUrl: "./order.component.html",
  styleUrls: ["./order.component.css"]
})
export class OrderComponent implements OnInit {
  orders: Array<any> = [];
  orderModel: Order;
  showNew: Boolean = false;
  submitType: string = "Save";
  selectedRow: number;
  orderList: Array<any> = [];

  comments: Observable<any>;

  constructor(private apollo: Apollo) { }

  ngOnInit() {
    this.submitType = "Save";
    this.displayOrders();
  }

  displayOrders() {
    const getOrders = gql`
      {
        orders{
          id
          name
          price
          number
          totalAmount
          createDate
          user{
            id
            name
          }
        }
      }
    `;

    this.apollo
      .watchQuery({
        query: getOrders,
        fetchPolicy: "network-only"
      })
      .valueChanges.pipe(map((result: any) => result.data.orders))
      .subscribe(data => {
        this.orders = data;
      });
  }

  onNew() {
    this.submitType = "Save";
    this.showNew = true;
    this.orderModel = new Order();
  }

  onSave() {
    if (this.submitType === "Save") {
      const saveOrder = gql`
      mutation Create($input: OrderInput!) {
        createOrder(order: $input) {
          id
          name
          price
          number
          createDate
          orderRatings
          totalAmount
          user {
            id
            name
          }
        }
      }
      `;
      this.apollo
        .mutate({
          mutation: saveOrder,
          variables: {
            input:{
            name: this.orderModel.Name,
            price: this.orderModel.Price,
            createDate: new Date(),
            number: this.orderModel.Number,
            userId: this.orderModel.UserId,
            orderRating: this.orderModel.OrderRating
          }
        }
        })
        .subscribe(
          ({ data }) => {
            this.displayOrders();
          },
          error => {
            console.log(this.orderModel);
            console.log("there was an error sending the query", error);
          }
        );
    } else {
      const updateOrder = gql`
      mutation Update($input: OrderInput!) {
        updateOrder(order: $input) {
          id
          name
          price
          number
          createDate
          orderRatings
          totalAmount
          user {
            id
            name
          }
        }
      }
      `;
      this.apollo
        .mutate({
          mutation: updateOrder,
          variables: {
            input:{
            id: this.orderModel.id,
            name: this.orderModel.Name,
            price: this.orderModel.Price,
            createDate: new Date(),
            number: this.orderModel.Number,
            userId: this.orderModel.UserId,
            orderRating: this.orderModel.OrderRating
            }
          }
        })
        .subscribe(
          ({ data }) => {
            console.log("got editdata", data);
            this.displayOrders();
          },
          error => {
           
            console.log("there was an error sending the query", error);
          }
        );
    }
    this.showNew = false;
  }

  onEdit(index: number) {
    this.selectedRow = index;
    this.orderModel = Object.assign({}, this.orders[this.selectedRow]);
    this.submitType = "Update";
     console.log(this.orderModel.id);
    this.showNew = true;
  }

  onDelete(index: number) {
    const deleteOrder = gql`
    mutation Delete($id: Int!){
      deleteOrder(id: $id){
        id
      }
      }
    `;
    this.apollo
      .mutate({
        mutation: deleteOrder,
        variables: {
          id: index + 1
        }
      })
      .subscribe(
        ({ data }) => {
          console.log("got editdata", data);
          this.displayOrders();
        },
        error => {
          console.log("there was an error sending the query", error);
        }
      );
  }

  onCancel() {
    this.showNew = false;
  }
}