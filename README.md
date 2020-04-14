# UniRestaurant
Unviersity Assignment - Paperless Restaurant App

## Instructions for usage
1) Clone repository
2) Create a Mongo Database called restaurant
In order to use the app it needs menus to read from.  Following these instructions you can see the admin section of the app whilst adding the necessary menus and items so the rest of the app can be tested.  
3) The homepage will get you to any of the areas you need.  Go to the homepage ('/') and then use the Admin button.  
4) Naviagting to any /admin page before logging in will redirect you to the login page.  Login using anything, this is currently not validated but for a real life app would be.
5) Once logged in select Menus
6) Click Add New Menu
7) The Menu will appear.  Close the modal and click Add Item to {{menuName}} menu.
8) Add as many items as you like to the menu.  Item ID must be unique.  
9) Repeat steps 6-8 if you wish to add more menus.  This is one of the features we have added to the app.  So you can not only have the main menu but also, specials menus, etc.  Only one menu can be used at the waiter view to generate an order.  
10) Once you've added menus and items to the menus you can then navigate back to the home page ('/') and test the other areas.
11) Waiter view will create orders so needs to be done before looking at Kitchen or Counter.  

## The different areas
I would advise having open in separate windows the /waiter page, /kitchen page and /admin pages.  You can flit between the four to get a good feel of how the app would be used.  

PLEASE NOTE: due to time restrictions I could not complete the 'user' pages or the 'reports' pages.  Please do not waste any of your time looking at these. 

### Waiter View (/waiter)
This firstly takes you to a page to select which Menu you will be creating an order from. 

On selecting the menu it takes you to a simple, responsive page that you can enter an Item ID (must be on the menu you have selected) and the table number.

If you are not sure what ID's are on the menu (if you were a new member of staff) there is a Menu Help button.  This displays the menu and you can click the item you wish to add.  This adds the ID in the form which can then be added to the order.  This is another added feature rather than just having an id input section.

Once items have been added to the order summary, quantities can be adjusted.  Adjusting the quantity to zero will remove the item from the order.  

You can then submit the order.  

### Kitchen view
Once an order is submitted, it will instantly show in the kitchen view.  The quantity is split up, so an item with quantity 2 will be shown as two lines on the kitchen view.  This is so when an item is finished it can be cleared.  Rather than waiting for 2 items to clear one line off the kitchen view.  

If for any reason the app crashed, when loaded the kitchen view will still show any live items.  When deleted an item is set in the database as complete and would no longer show on this page.  

You will see on this page a timer that is from when the order is submitted on the waiter page.  This will increment continually until the item is completed.  We have implemented a colour scheme to show items that have been on a while.  Currently the timing of this change is short; it would be much longer in the real world.  

### Counter View
The counter view allows the user to view active orders on the bills section.  Any order that has not been settled will be shown here.  Selecting the order will navigate you to another page to individually display the bill.  There is a button there to settle the order. From this individual bill page you can print the bill.  The bill can be printed to any size paper you require.  Traditionally bills are quite small so I allowed for this.    


