import postgres from "postgres";

//conexion a la base de datos foodservice
//const dbConnect = postgres('postgres://foodservice_user:5T3TsgzYzthVflvKtwuOJKHzZhVuWwlv@dpg-covms0g21fec73fniarg-a:5432/foodservice');
const dbConnect = postgres('postgres://postgres:root@localhost:5432/foodservice');
export default dbConnect;