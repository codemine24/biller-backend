/**
 * @swagger
 * tags:
 *   name: User
 *   description: API endpoints related to user
 */

// Get all users
/**
 * @swagger
 * /api/v1/user:
 *   get:
 *     summary: Retrieve all users
 *     description: Retrieves a list of all users
 *     tags: [User]
 *     security:
 *       - AdminAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: number
 *         description: The page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *         description: The number of items per page
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *         description: The field to sort by
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: asc | desc
 *           enum: [asc, desc]
 *         description: The order to sort by (asc or desc)
 *       - in: query
 *         name: searchTerm
 *         schema:
 *           type: string
 *         description: The search term for filtering
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [ADMIN, RETAILER, USER]
 *         description: The role of the user for filtering
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [ACTIVE, INACTIVE, BLOCKED]
 *         description: The status of the user for filtering
 *     responses:
 *       200:
 *         description: If the request is successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                  success:
 *                    type: boolean
 *                    description: Indicates the success or failure of the operation
 *                  message:
 *                    type: string
 *                    description: A message indicating the result of the operation
 *                    example: Users retrieved are successful
 *                  meta:
 *                    type: object
 *                    properties:
 *                      page:
 *                        type: number
 *                        description: The current page number
 *                        example: 1
 *                      limit:
 *                        type: number
 *                        description: The number of items per page
 *                        example: 10
 *                      total:
 *                        type: number
 *                        description: The total number of users
 *                        example: 14
 *                  data:
 *                    type: array
 *                    items:
 *                      type: object
 *                      properties:
 *                        id:
 *                          type: string
 *                          description: The ID of the user
 *                          example: 656c6ccf-199c-454c-937b-f41c148f673b
 *                        name:
 *                          type: string
 *                          description: The name of the user
 *                          example: John Doe
 *                        email:
 *                          type: string
 *                          description: The email address of the user
 *                          example: user@example.com | null
 *                        contact_number:
 *                          type: string
 *                          description: The contact number of the user
 *                          example: '01511111111'
 *                        role:
 *                          type: string
 *                          description: The role of the user
 *                          example: USER | RETAILER | ADMIN
 *                        status:
 *                          type: string
 *                          description: The status of the user
 *                          example: ACTIVE | INACTIVE | BLOCKED
 *                        profile_pic:
 *                          type: string
 *                          format: uri
 *                          nullable: true
 *                          description: The profile picture of the user
 *                          example: https://example.com/profile.jpg | null
 *                        created_at:
 *                          type: string
 *                          format: date-time
 *                          description: The creation date of the user
 *                          example: 2023-01-01T00:00:00.000Z
 *                        updated_at:
 *                          type: string
 *                          format: date-time
 *                          description: The last update date of the user
 *                          example: 2023-01-01T00:00:00.000Z
 */

// Get Profile
/**
 * @swagger
 * /api/v1/user/profile:
 *   get:
 *     summary: Retrieve user profile
 *     description: Retrieve the profile of the authenticated user
 *     tags: [User]
 *     security:
 *       - AdminAuth: []
 *       - RetailerAuth: []
 *       - UserAuth: []
 *     responses:
 *       200:
 *         description: If the request is successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                  success:
 *                    type: boolean
 *                    description: Indicates the success or failure of the operation
 *                  message:
 *                    type: string
 *                    description: A message indicating the result of the operation
 *                    example: Profile retrieved is successful
 *                  data:
 *                    type: object
 *                    properties:
 *                       id:
 *                         type: string
 *                         description: The ID of the user
 *                         example: 656c6ccf-199c-454c-937b-f41c148f673b
 *                       name:
 *                         type: string
 *                         description: The name of the user
 *                         example: John Doe
 *                       email:
 *                         type: string
 *                         description: The email address of the user
 *                         example: user@example.com | null
 *                       contact_number:
 *                         type: string
 *                         description: The contact number of the user
 *                         example: '01511111111'
 *                       role:
 *                         type: string
 *                         description: The role of the user
 *                         example: USER | RETAILER | ADMIN
 *                       status:
 *                         type: string
 *                         description: The status of the user
 *                         example: ACTIVE | INACTIVE | BLOCKED
 *                       profile_pic:
 *                         type: string
 *                         format: uri
 *                         nullable: true
 *                         description: The profile picture of the user
 *                         example: https://example.com/profile.jpg | null
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                         description: The creation date of the user
 *                         example: 2023-01-01T00:00:00.000Z
 *                       updated_at:
 *                         type: string
 *                         format: date-time
 *                         description: The last update date of the user
 *                         example: 2023-01-01T00:00:00.000Z
 */

// Get single user
/**
 * @swagger
 * /api/v1/user/{id}:
 *   get:
 *     summary: Retrieve single user by ID
 *     description: Retrieve a single user by ID
 *     tags: [User]
 *     security:
 *       - AdminAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user to retrieve
 *     responses:
 *       200:
 *         description: If the request is successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                  success:
 *                    type: boolean
 *                    description: Indicates the success or failure of the operation
 *                  message:
 *                    type: string
 *                    description: A message indicating the result of the operation
 *                    example: User retrieved is successful
 *                  data:
 *                    type: object
 *                    properties:
 *                       id:
 *                         type: string
 *                         description: The ID of the user
 *                         example: 656c6ccf-199c-454c-937b-f41c148f673b
 *                       name:
 *                         type: string
 *                         description: The name of the user
 *                         example: John Doe
 *                       email:
 *                         type: string
 *                         description: The email address of the user
 *                         example: user@example.com | null
 *                       contact_number:
 *                         type: string
 *                         description: The contact number of the user
 *                         example: '01511111111'
 *                       role:
 *                         type: string
 *                         description: The role of the user
 *                         example: USER | RETAILER | ADMIN
 *                       status:
 *                         type: string
 *                         description: The status of the user
 *                         example: ACTIVE | INACTIVE | BLOCKED
 *                       profile_pic:
 *                         type: string
 *                         format: uri
 *                         nullable: true
 *                         description: The profile picture of the user
 *                         example: https://example.com/profile.jpg | null
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                         description: The creation date of the user
 *                         example: 2023-01-01T00:00:00.000Z
 *                       updated_at:
 *                         type: string
 *                         format: date-time
 *                         description: The last update date of the user
 *                         example: 2023-01-01T00:00:00.000Z
 *       404:
 *         description: If the user is not found
 *       401:
 *         description: If the user is not authenticated for the request. Only admin can get a user
 */

// Update profile
/**
 * @swagger
 * /api/v1/user/update-profile:
 *   patch:
 *     summary: Update user profile
 *     description: Update the profile of the authenticated user
 *     tags: [User]
 *     security:
 *       - AdminAuth: []
 *       - RetailerAuth: []
 *       - UserAuth: []
 *     requestBody:
 *       description: Profile must be available and required field
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               profile_pic:
 *                 type: string
 *                 format: binary
 *                 description: The profile picture of the user
 *               data:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                     description: The name of the user
 *                     example: John Doe
 *                   email:
 *                     type: string
 *                     format: email
 *                     description: The email address of the user
 *                     example: user@example.com | null
 *     responses:
 *       200:
 *         description: If the request is successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                  success:
 *                    type: boolean
 *                    description: Indicates the success or failure of the operation
 *                  message:
 *                    type: string
 *                    description: A message indicating the result of the operation
 *                    example: Profile updated is successful
 *                  data:
 *                    type: object
 *                    properties:
 *                       id:
 *                         type: string
 *                         description: The ID of the user
 *                         example: 656c6ccf-199c-454c-937b-f41c148f673b
 *                       name:
 *                         type: string
 *                         description: The name of the user
 *                         example: John Doe
 *                       email:
 *                         type: string
 *                         description: The email address of the user
 *                         example: user@example.com | null
 *                       contact_number:
 *                         type: string
 *                         description: The contact number of the user
 *                         example: '01511111111'
 *                       role:
 *                         type: string
 *                         description: The role of the user
 *                         example: USER | RETAILER | ADMIN
 *                       profile_pic:
 *                         type: string
 *                         format: uri
 *                         nullable: true
 *                         description: The profile picture of the user
 *                         example: https://example.com/profile.jpg | null
 *       401:
 *         description: If the user is not authenticated for the request.
 */

// Update user by admin
/**
 * @swagger
 * /api/v1/user/update-user/{id}:
 *   patch:
 *     summary: Update and delete user by admin
 *     description: Update user role and status and delete user
 *     tags: [User]
 *     security:
 *       - AdminAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user to update or delete
 *     requestBody:
 *       description: One of the following must be available
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               role:
 *                 type: string
 *                 description: The role of the user
 *                 example: USER | RETAILER | ADMIN
 *               status:
 *                 type: string
 *                 description: The status of the user
 *                 example: ACTIVE | INACTIVE | BLOCKED
 *               is_deleted:
 *                 type: boolean
 *                 description: If the user is deleted or not
 *                 example: true
 *     responses:
 *       200:
 *         description: If the request is successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                  success:
 *                    type: boolean
 *                    description: Indicates the success or failure of the operation
 *                  message:
 *                    type: string
 *                    description: A message indicating the result of the operation
 *                    example: Successfully updated the user
 *                  data:
 *                    type: object
 *                    properties:
 *                       id:
 *                         type: string
 *                         description: The ID of the user
 *                         example: 656c6ccf-199c-454c-937b-f41c148f673b
 *                       name:
 *                         type: string
 *                         description: The name of the user
 *                         example: John Doe
 *                       email:
 *                         type: string
 *                         description: The email address of the user
 *                         example: user@example.com | null
 *                       contact_number:
 *                         type: string
 *                         description: The contact number of the user
 *                         example: '01511111111'
 *                       role:
 *                         type: string
 *                         description: The role of the user
 *                         example: USER | RETAILER | ADMIN
 *                       status:
 *                         type: string
 *                         description: The status of the user
 *                         example: ACTIVE | INACTIVE | BLOCKED
 *                       profile_pic:
 *                         type: string
 *                         format: uri
 *                         nullable: true
 *                         description: The profile picture of the user
 *                         example: https://example.com/profile.jpg | null
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                         description: The creation date of the user
 *                         example: 2023-01-01T00:00:00.000Z
 *                       updated_at:
 *                         type: string
 *                         format: date-time
 *                         description: The last update date of the user
 *                         example: 2023-01-01T00:00:00.000Z
 *       401:
 *         description: If the user is not authenticated for the request.
 */
