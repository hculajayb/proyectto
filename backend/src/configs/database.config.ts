import postgres from "postgres";

//conexion a la base de datos foodservice
const dbConnect = postgres('postgres://postgres:root@localhost:5432/foodservice');
export default dbConnect;