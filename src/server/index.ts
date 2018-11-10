// tslint:disable-next-line:match-default-export-name
import express, { Request, Response, Router } from 'express'
export const serverRouter: Router = express.Router()

// tslint:disable-next-line:no-implicit-dependencies
import fs from 'fs'
import { processModel } from './modelReader'
import { Model } from '../class/index.d'

let objModel: Model
fs.readFile('data/cube.obj', (err: Error, data: Buffer) => {
  if (err) {
    throw err
  }
  // objModel = JSON.parse(data.toString())
  objModel = processModel(data.toString())
})

namespace GetModel {
  export interface IRequest {
    name: string
  }
  export interface IResponse {
    model: Model
  }
}

serverRouter.post('/getModel', (req: Request, res: Response) => {
  const request: GetModel.IRequest = <GetModel.IRequest>req.body
  const response: GetModel.IResponse = {
    model: objModel
  }

  res.json(response)
})
