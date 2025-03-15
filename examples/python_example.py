class UserService:
    # @ai-link name=get_user
    # @ai-depends on=validate_user_id,format_user_data
    # @ai-related User,DatabaseConnection
    # @ai-exec query,user
    def get_user(self, user_id: int):
        """
        Retrieve user information by ID.
        """
        if not self.validate_user_id(user_id):
            raise ValueError("Invalid user ID")
        
        user_data = self.db.query(f"SELECT * FROM users WHERE id = {user_id}")
        return self.format_user_data(user_data)

    # @ai-link name=validate_user_id
    # @ai-depends on=None
    # @ai-related User
    # @ai-exec validation
    def validate_user_id(self, user_id: int) -> bool:
        """
        Validate user ID format and existence.
        """
        return isinstance(user_id, int) and user_id > 0

    # @ai-link name=format_user_data
    # @ai-depends on=None
    # @ai-related User
    # @ai-exec format,user
    def format_user_data(self, user_data: dict) -> dict:
        """
        Format raw user data for API response.
        """
        return {
            "id": user_data["id"],
            "username": user_data["username"],
            "email": user_data["email"],
            "created_at": user_data["created_at"].isoformat()
        } 