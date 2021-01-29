type HandlebarOptions = {
  viewEngine?: {
    extName?: string,
    defaultLayout?: string,
    partialsDir?: string,
    layoutsDir?: string,
  }
  viewPath?: string,
  extName?: string,
};

type LayerObject = {
  gid: number;
  height: number;
  id: number;
  name: string;
  properties?: {
    name: string;
    type: string;
    value: string;
  }[];
  rotation: number;
  type: string;
  visible: boolean;
  width: number;
  x: number;
  y: number;
};

type LayerData = {
  data?: number[];
  height?: number;
  id?: number;
  name: string;
  opacity: number;
  type: string;
  visible: boolean;
  width?: number;
  x: number;
  y: number;
  objects?: LayerObject[];
};

declare module 'nodemailer-express-handlebars' {
  function nodemailerExpressHandlebars(data: HandlebarOptions): any;

  module nodemailerExpressHandlebars { }
  export = nodemailerExpressHandlebars;
}
