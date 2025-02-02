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
import { HomeLoan } from '@models/HomeLoan';
import { ServiceStatus } from 'src/models/ServiceStatus';
import { BizResponse } from 'src/models/BizResponse';
import { IHomeLoanService as IHomeLoanService } from 'src/services/IHomeLoanService';

@Controller('homeloans')
@UseGuards(JwtAuthGuard)
export class HomeLoanController {
    constructor(@Inject('IHomeLoanService') private readonly homeLoanService: IHomeLoanService) {}
        
    // GET matching home loans
    // GET /homeloans?firstName=Tom&lastName=Hank
    @Get()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('api.read')
    async getMatchingHomeLoans(@Query() query: Partial<HomeLoan>): Promise<HomeLoan[]> {
        const serviceResponse = await this.homeLoanService.searchHomeLoans(query);

        // Whether you have matching home loans or not, the response status code
        // is always 200 - OK for a matching search.
        return serviceResponse.data;
    }

    // GET by ID
    // GET /homeLoans/1
    @Get(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('api.read')
    async getHomeLoanById(
        @Param('id') id: number,
        @Res() response: Response): Promise<HomeLoan | null> {
        // Call service to get specific home loan.
        console.log("Inside Search By ID")
        const serviceResponse = await this.homeLoanService.getHomeLoanById (id);

        if (!serviceResponse?.data) {
            // Specified home loan with the ID does not exist - 404 Not Found.
            response
                .status (HttpStatus.NOT_FOUND)
                .json ({
                    message: `Home Loan with ID '${id}' could not be found.`
                })
                .send ();
            return;
        }

        // Matching unique home loan with ID exists - 200 OK.
        response
            .status (HttpStatus.OK)
            .json (serviceResponse.data)
            .send ();
    }

    // POST to create a new home loan
    // POST /homeLoans/
    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('api.createOrModify')
    @HttpCode(201)
    async addHomeLoan(
            @Body() newHomeLoan: HomeLoan,
            @Req() request: Request,
            @Res() response: Response)
        : Promise<void> {
        // Call service to create new home loan.
        const serviceResponse = await this.homeLoanService.addHomeLoan (newHomeLoan);
        
        if (!serviceResponse.isValid ()) {
            // Could not create home loan - there are validation errors! 422 Unprocessable Entity.
            response
                .status (HttpStatus.UNPROCESSABLE_ENTITY)
                .json ({
                    message: "Business validations failed for adding new home loan.",
                    validationFailures: serviceResponse.validationFailures
                })
                .send ();
            return;
        }

        // Home loan could be created. Prepare `Location` response header.
        const location
            = `${request.protocol}://${request.get('host')}/homeLoans/${serviceResponse.data.id}`;

        // 201 - Created.
        response
            .status (HttpStatus.CREATED)
            .location (location)
            .send ();
    }

    // PUT to modify an existing home loan
    // PUT /homeLoans/
    @Put()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('api.createOrModify')
    @HttpCode(204)
    async modifyHomeLoan(
        @Body() existingHomeLoan: HomeLoan,
        @Res() response: Response): Promise<BizResponse> {
        // Call service to update existing home loan.
        const serviceResponse = await this.homeLoanService.modifyHomeLoan (existingHomeLoan);

        if (!serviceResponse.isValid ()) {
            // There are validation errors! 422 Unprocessable Entity.
            response
                .status (HttpStatus.UNPROCESSABLE_ENTITY)
                .json ({
                    message: "Business validations failed for modifying existing home loan.",
                    validationFailures: serviceResponse.validationFailures
                })
                .send ();
            return;
        }

        // No validation errors, but home loan with ID does not exist.
        if (serviceResponse.status == ServiceStatus.SpecificItemNotFound) {
            // 404 - Not Found.
            response
                .status (HttpStatus.NOT_FOUND)
                .json ({
                    message: `Home Loan with ID '${ existingHomeLoan.id }' could not be found.`
                })
                .send ();
            return;
        }

        // Home loan could be successfully modified - 204 No Content.
        response
            .status (HttpStatus.NO_CONTENT)
            .send ();
    }

    // DELETE by ID
    // DELETE /homeLoans/1
    @Delete(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('api.deleteOrPurge')
    @HttpCode(204)
    async deleteHomeLoan(
        @Param('id') id: number,
        @Res() response: Response): Promise<BizResponse> {
        // Call service to delete existing home loan.
        const serviceResponse = await this.homeLoanService.deleteHomeLoan (id);

        if (serviceResponse.status === ServiceStatus.SpecificItemNotFound) {
            // Home loan with ID does not exist - 404 Not Found.
            response
                .status (HttpStatus.NOT_FOUND)
                .json ({
                    message: `Home loan with ID '${id}' could not be found.`
                })
                .send ();

            return;
        }

        // Home loan could be successfully deleted - 204 No Content.
        response
            .status (HttpStatus.NO_CONTENT)
            .send ();
    }
}