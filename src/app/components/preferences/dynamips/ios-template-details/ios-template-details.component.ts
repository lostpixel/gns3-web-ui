import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from '@angular/router';
import { ServerService } from '../../../../services/server.service';
import { Server } from '../../../../models/server';
import { ToasterService } from '../../../../services/toaster.service';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { IosTemplate } from '../../../../models/templates/ios-template';
import { IosService } from '../../../../services/ios.service';
import { IosConfigurationService } from '../../../../services/ios-configuration.service';


@Component({
    selector: 'app-ios-template-details',
    templateUrl: './ios-template-details.component.html',
    styleUrls: ['./ios-template-details.component.scss']
})
export class IosTemplateDetailsComponent implements OnInit {
    server: Server;
    iosTemplate: IosTemplate;

    isSymbolSelectionOpened: boolean = false;

    networkAdaptersForTemplate: string[] = [];
    platforms: string[] = [];
    platformsWithEtherSwitchRouterOption = {};
    platformsWithChassis = {};
    chassis = {};
    defaultRam = {};
    defaultNvram = {};
    networkAdapters = {};
    networkAdaptersForPlatform = {};
    networkModules = {};

    constructor(
        private route: ActivatedRoute,
        private serverService: ServerService,
        private iosService: IosService,
        private toasterService: ToasterService,
        private formBuilder: FormBuilder,
        private iosConfigurationService: IosConfigurationService
    ) {}

    ngOnInit() {
        const server_id = this.route.snapshot.paramMap.get("server_id");
        const template_id = this.route.snapshot.paramMap.get("template_id");
        this.serverService.get(parseInt(server_id, 10)).then((server: Server) => {
            this.server = server;

            this.getConfiguration();
            this.iosService.getTemplate(this.server, template_id).subscribe((iosTemplate: IosTemplate) => {
                this.iosTemplate = iosTemplate;

                this.fillAdaptersData();
            });
        });
    }

    getConfiguration() {
        this.networkModules = this.iosConfigurationService.getNetworkModules();
        this.networkAdaptersForPlatform = this.iosConfigurationService.getNetworkAdaptersForPlatform();
        this.networkAdapters = this.iosConfigurationService.getNetworkAdapters();
        this.platforms = this.iosConfigurationService.getAvailablePlatforms();
        this.platformsWithEtherSwitchRouterOption = this.iosConfigurationService.getPlatformsWithEtherSwitchRouterOption();
        this.platformsWithChassis = this.iosConfigurationService.getPlatformsWithChassis();
        this.chassis = this.iosConfigurationService.getChassis();
        this.defaultRam = this.iosConfigurationService.getDefaultRamSettings();
    }

    fillAdaptersData() {
        if (this.iosTemplate.slot0) this.networkAdaptersForTemplate[0] = this.iosTemplate.slot0;
        if (this.iosTemplate.slot1) this.networkAdaptersForTemplate[1] = this.iosTemplate.slot1;
        if (this.iosTemplate.slot2) this.networkAdaptersForTemplate[2] = this.iosTemplate.slot2;
        if (this.iosTemplate.slot3) this.networkAdaptersForTemplate[3] = this.iosTemplate.slot3;
        if (this.iosTemplate.slot4) this.networkAdaptersForTemplate[4] = this.iosTemplate.slot4;
        if (this.iosTemplate.slot5) this.networkAdaptersForTemplate[5] = this.iosTemplate.slot5;
        if (this.iosTemplate.slot6) this.networkAdaptersForTemplate[6] = this.iosTemplate.slot6;
        if (this.iosTemplate.slot7) this.networkAdaptersForTemplate[7] = this.iosTemplate.slot7;
    }

    completeAdaptersData() {
        if (this.networkAdaptersForTemplate[0]) this.iosTemplate.slot0 = this.networkAdaptersForTemplate[0];
        if (this.networkAdaptersForTemplate[1]) this.iosTemplate.slot1 = this.networkAdaptersForTemplate[1];
        if (this.networkAdaptersForTemplate[2]) this.iosTemplate.slot2 = this.networkAdaptersForTemplate[2];
        if (this.networkAdaptersForTemplate[3]) this.iosTemplate.slot3 = this.networkAdaptersForTemplate[3];
        if (this.networkAdaptersForTemplate[4]) this.iosTemplate.slot4 = this.networkAdaptersForTemplate[4];
        if (this.networkAdaptersForTemplate[5]) this.iosTemplate.slot5 = this.networkAdaptersForTemplate[5];
        if (this.networkAdaptersForTemplate[6]) this.iosTemplate.slot6 = this.networkAdaptersForTemplate[6];
        if (this.networkAdaptersForTemplate[7]) this.iosTemplate.slot7 = this.networkAdaptersForTemplate[7];
    }

    onSave() {
        this.completeAdaptersData();
        
        this.iosService.saveTemplate(this.server, this.iosTemplate).subscribe((iosTemplate: IosTemplate) => {
            this.toasterService.success("Changes saved");
        });
    }

    chooseSymbol() {
        this.isSymbolSelectionOpened = !this.isSymbolSelectionOpened;
    }

    symbolChanged(chosenSymbol: string) {
        this.iosTemplate.symbol = chosenSymbol;
    }
}
