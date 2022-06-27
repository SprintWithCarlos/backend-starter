/* eslint-disable operator-linebreak */
/* eslint-disable comma-dangle */
/* eslint-disable function-paren-newline */
/* eslint-disable implicit-arrow-linebreak */
import express, { Response, Application, Request } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

class App {
  app: Application = express();

  constructor() {
    this.middlewares();
    this.routes();
  }

  middlewares() {
    this.app.use(cors());
    this.app.use(express.json());
    this.app.use(helmet());
    this.app.use(morgan("dev"));
  }

  routes() {
    this.app.get("/home", (req: Request, res: Response) => res.send("Hello World"));
    this.app.get("/json", (req: Request, res: Response) => res.json({ message: "OK" }));
    this.app.post("/get-request-body", (req: Request, res: Response) =>
      res.json({ body: { ...req.body } })
    );
    this.app.post("/get-auth", (req: Request, res: Response) => {
      if (
        req.headers.authorization === undefined ||
        req.headers.authorization?.split(" ").length === 1 // it should be "Bearer" plus the actual token
      ) {
        res.status(401).json({ error: "You are not authenticated" });
      } else {
        res.status(200).json({ token: req.headers.authorization.split(" ").pop() });
      }
    });
  }
}
const expressApp = new App();
export default expressApp;
