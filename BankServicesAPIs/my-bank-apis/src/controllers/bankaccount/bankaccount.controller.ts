import {
    Controller,
    Get, Post, Put, Delete,
    Param, Query, Body, UseGuards,
    HttpStatus, HttpCode,
    Req, Res,
    Inject,
  } from '@nestjs/common';

import { JwtAuthGuard } from 'src/guards/jwtAuthGuard';
import { Roles, RolesGuard } from 'src/guards/rolesGuard';
import { Request, Response } from 'express';
import { SavingsBankAccount } from '@models/SavingsBankAccount';
import { ServiceStatus } from 'src/models/ServiceStatus';
import { BizResponse } from 'src/models/BizResponse';
import { ISavingsBankAccountService as ISavingsBankAccountService } from 'src/services/ISavingsBankAccountService';

@Controller('savingsbankaccounts')
@UseGuards(JwtAuthGuard)
export class SavingsBankAccountController {
    constructor(@Inject('ISavingsBankAccountService') private readonly savingsBankAccountService: ISavingsBankAccountService) {}
        
    // GET matching savings bank accounts
    // GET /savingsbankaccounts?firstName=Tom&lastName=Hank
    @Get()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('api.read')
    async getMatchingSavingsBankAccounts(@Query() query: Partial<SavingsBankAccount>): Promise<SavingsBankAccount[]> {
        const serviceResponse = await this.savingsBankAccountService.searchSavingsBankAccounts(query);

        // Whether you have matching savings bank accounts or not, the response status code
        // is always 200 - OK for a matching search.
        return serviceResponse.data;
    }

    // GET by ID
    // GET /savingsBankAccounts/1
    @Get(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('api.read')
    async getSavingsBankAccountById(
        @Param('id') id: number,
        @Res() response: Response): Promise<SavingsBankAccount | null> {
        // Call service to get specific savings bank account.
        const serviceResponse = await this.savingsBankAccountService.getSavingsBankAccountById (id);

        if (!serviceResponse?.data) {
            // Specified savings bank account with the ID does not exist - 404 Not Found.
            response
                .status (HttpStatus.NOT_FOUND)
                .json ({
                    message: `Savings Bank Account with ID '${id}' could not be found.`
                })
                .send ();
            return;
        }

        // Matching unique savings bank account with ID exists - 200 OK.
        response
            .status (HttpStatus.OK)
            .json (serviceResponse.data)
            .send ();
    }

    // POST to create a new savings bank account
    // POST /savingsBankAccounts/
    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('api.createOrModify')
    @HttpCode(201)
    async addSavingsBankAccount(
            @Body() newSavingsBankAccount: SavingsBankAccount,
            @Req() request: Request,
            @Res() response: Response)
        : Promise<void> {
        // Call service to create new savings bank account.
        const serviceResponse = await this.savingsBankAccountService.addSavingsBankAccount (newSavingsBankAccount);
        
        if (!serviceResponse.isValid ()) {
            // Could not create savings bank account - there are validation errors! 422 Unprocessable Entity.
            response
                .status (HttpStatus.UNPROCESSABLE_ENTITY)
                .json ({
                    message: "Business validations failed for adding new savings bank account.",
                    validationFailures: serviceResponse.validationFailures
                })
                .send ();
            return;
        }

        // Savings bank account could be created. Prepare `Location` response header.
        const location
            = `${request.protocol}://${request.get('host')}/savingsBankAccounts/${serviceResponse.data.id}`;

        // 201 - Created.
        response
            .status (HttpStatus.CREATED)
            .location (location)
            .send ();
    }

    // PUT to modify an existing savings bank account
    // PUT /savingsBankAccounts/
    @Put()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('api.createOrModify')
    @HttpCode(204)
    async modifySavingsBankAccount(
        @Body() existingSavingsBankAccount: SavingsBankAccount,
        @Res() response: Response): Promise<BizResponse> {
        // Call service to update existing savings bank account.
        const serviceResponse = await this.savingsBankAccountService.modifySavingsBankAccount (existingSavingsBankAccount);

        if (!serviceResponse.isValid ()) {
            // There are validation errors! 422 Unprocessable Entity.
            response
                .status (HttpStatus.UNPROCESSABLE_ENTITY)
                .json ({
                    message: "Business validations failed for modifying existing savings bank account.",
                    validationFailures: serviceResponse.validationFailures
                })
                .send ();
            return;
        }

        // No validation errors, but savings bank account with ID does not exist.
        if (serviceResponse.status == ServiceStatus.SpecificItemNotFound) {
            // 404 - Not Found.
            response
                .status (HttpStatus.NOT_FOUND)
                .json ({
                    message: `Savings Bank Account with ID '${ existingSavingsBankAccount.id }' could not be found.`
                })
                .send ();
            return;
        }

        // Savings bank account could be successfully modified - 204 No Content.
        response
            .status (HttpStatus.NO_CONTENT)
            .send ();
    }

    // DELETE by ID
    // DELETE /savingsBankAccounts/1
    @Delete(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('api.deleteOrPurge')
    @HttpCode(204)
    async deleteSavingsBankAccount(
        @Param('id') id: number,
        @Res() response: Response): Promise<BizResponse> {
        // Call service to delete existing savings bank account.
        const serviceResponse = await this.savingsBankAccountService.deleteSavingsBankAccount (id);

        if (serviceResponse.status === ServiceStatus.SpecificItemNotFound) {
            // Savings bank account with ID does not exist - 404 Not Found.
            response
                .status (HttpStatus.NOT_FOUND)
                .json ({
                    message: `Savings bank account with ID '${id}' could not be found.`
                })
                .send ();

            return;
        }

        // Savings bank account could be successfully deleted - 204 No Content.
        response
            .status (HttpStatus.NO_CONTENT)
            .send ();
    }
}