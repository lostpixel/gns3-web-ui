import { Component, OnInit } from '@angular/core';
import { Location } from "@angular/common";
import { Router } from "@angular/router";

import { ServerService } from "../shared/services/server.service";
import { Server } from "../shared/models/server";


@Component({
  selector: 'app-local-server',
  templateUrl: './local-server.component.html',
  styleUrls: ['./local-server.component.scss']
})
export class LocalServerComponent implements OnInit {

  constructor(private location: Location,
              private router: Router,
              private serverService: ServerService) { }

  ngOnInit() {
    this.serverService.getLocalServer(location.hostname, parseInt(location.port, 10))
      .then((server: Server) => {
        this.router.navigate(['/server', server.id, 'projects']);
      });
  }

}
