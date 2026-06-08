
interface User{
    email: String;
    fullName?: String
    password: String
}

export const Role = Object.freeze({
    USER: "user",
    ADMIN: "admin"
})