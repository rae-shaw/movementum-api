Movementum API
===================


Summary
-------
Movementum is a class planning tool designed by and for movement instructors. It fills a gap in class and lesson planning specifically for movement instructors, like dance, yoga, and aerial arts instructors.
Instructors can create folders for classes and organize their lesson plans by class. Instructors can keep track of your students' progress.



API Overview
------------
```# /api
.
 	* /auth
 		* POST
 			* /login
 	* /folder
 		* GET
 			* /
 			* /:id
 		* POST
 			* /
 	* /plan
 		* GET
 			* /
 			* /:id
 		* POST
 			* /
 		* PATCH 
 			* /:id
 		* DELETE
 			* /:id
 	* /user
 		* POST
 			* /
 	
```
POST `/api/auth/login`
```
//res.body
JWT token
```

GET `/api/folder/`
```

//res.body
[
	{
		id: id,
		name: name,
		date_created: date_created

	}
]
```
GET `/api/folder/id`
```
//req.body
{
	id : id
}
//res.body
{
	id: id,
	name: name,
	date_created: date_created
}
```
POST `/api/folder/id`
```
//req.body
{
	name : name
}
//res.body
{
	id: id,
	name: name,
	date_created: date_created
}
```
GET `/api/plan`
```
//res.body
{
	[
		id : id,
		name : name,
		class_date : class_date,
		warm_up : warm_up,
		skills : skills,
		notes : notes,
		students : students,
		folder_id : folder_id,
		date_created : date_created
	]
}
```
GET `/api/plan/:id`
```
//req.body
{
	id : id
}
//res.body
{
	id : id,
	name : name,
	class_date : class_date,
	warm_up : warm_up,
	skills : skills,
	notes : notes,
	students : students,
	folder_id : folder_id,
	date_created : date_created
}
```
POST `/api/plan/`
```
//req.body
{
	name : name,
	class_date : class_date,
	warm_up : warm_up,
	skills : skills,
	notes : notes,
	students : students,
	folder_id : folder_id,
}
//res.body
{
	id : id,
	name : name,
	class_date : class_date,
	warm_up : warm_up,
	skills : skills,
	notes : notes,
	students : students,
	folder_id : folder_id,
	date_created : date_created

}
```
DELETE `/api/plan/:id`
```
//req.body
{
	id : id
}
//res.body
{
	status : 204
}
```

PATCH `/api/plan/:id`
```
//req.body
{
	id : id
}
//res.body
{
	status : 204
}
```




Built with:
-----------
Client-side
* HTML5
* CSS
* JavaScript
* React

Server-side
* Node
* Knex
* Express
* PostgreSQL
* Heroku
* Zeit