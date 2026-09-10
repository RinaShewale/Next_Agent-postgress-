import { pool } from "../config/db.js";


// =================================================
// Convert PostgreSQL row → Project object
// =================================================

const mapRow = (row) => {
    if (!row) return null;

    const project = {
        id: row.id,
        user: row.user_id,
        title: row.title,
        sandboxID: row.sandbox_id,

        deploymentStatus:
            row.deployment_status,

        productionUrl:
            row.production_url,

        deploymentName:
            row.deployment_name,

        serviceName:
            row.service_name,

        ingressName:
            row.ingress_name,

        buildJobName:
            row.build_job_name,

        buildConfigMapName:
            row.build_config_map_name,

        deployedAt:
            row.deployed_at,

        createdAt:
            row.created_at,

        updatedAt:
            row.updated_at,
    };


    // --------------------------------
    // Keep Mongoose-like .save()
    // --------------------------------

    Object.defineProperty(project, "save", {
        value: async function () {

            const result =
                await pool.query(
                    `UPDATE projects
                     SET
                        user_id = $1,
                        title = $2,
                        sandbox_id = $3,
                        deployment_status = $4,
                        production_url = $5,
                        deployment_name = $6,
                        service_name = $7,
                        ingress_name = $8,
                        build_job_name = $9,
                        build_config_map_name = $10,
                        deployed_at = $11,
                        updated_at = NOW()
                     WHERE id = $12
                     RETURNING *`,
                    [
                        this.user,
                        this.title,
                        this.sandboxID,
                        this.deploymentStatus,
                        this.productionUrl,
                        this.deploymentName,
                        this.serviceName,
                        this.ingressName,
                        this.buildJobName,
                        this.buildConfigMapName,
                        this.deployedAt,
                        this.id,
                    ]
                );


            const updated =
                mapRow(result.rows[0]);


            Object.assign(
                this,
                updated
            );


            return this;
        },

        enumerable: false,
    });


    return project;
};


// =================================================
// Project Model
// =================================================

const Project = {

    // --------------------------------
    // Find by ID
    // --------------------------------

    findById: async (id) => {

        const result =
            await pool.query(
                `SELECT *
                 FROM projects
                 WHERE id = $1`,
                [id]
            );


        return mapRow(
            result.rows[0]
        );
    },


    // --------------------------------
    // Find All Projects
    // --------------------------------

    findAll: async (filter = {}) => {

        const columnMap = {
            user: "user_id",
        };


        const conditions = [];
        const values = [];

        let index = 1;


        for (
            const [key, value]
            of Object.entries(filter)
        ) {

            const column =
                columnMap[key];


            if (!column) {
                throw new Error(
                    `Invalid Project.findAll field: ${key}`
                );
            }


            conditions.push(
                `${column} = $${index}`
            );

            values.push(value);

            index++;
        }


        const whereClause =
            conditions.length
                ? `WHERE ${conditions.join(" AND ")}`
                : "";


        const result =
            await pool.query(
                `SELECT *
                 FROM projects
                 ${whereClause}
                 ORDER BY created_at DESC`,
                values
            );


        return result.rows.map(
            mapRow
        );
    },


    // --------------------------------
    // Find One
    // --------------------------------

    findOne: async (filter) => {

        const columnMap = {

            _id: "id",

            id: "id",

            user: "user_id",

            title: "title",

            sandboxID:
                "sandbox_id",

            deploymentStatus:
                "deployment_status",
        };


        const entries =
            Object.entries(filter);


        if (!entries.length) {

            throw new Error(
                "Project.findOne requires a filter"
            );
        }


        const conditions = [];
        const values = [];


        entries.forEach(
            ([key, value], index) => {

                const column =
                    columnMap[key];


                if (!column) {

                    throw new Error(
                        `Invalid Project.findOne field: ${key}`
                    );
                }


                conditions.push(
                    `${column} = $${index + 1}`
                );


                values.push(value);
            }
        );


        const result =
            await pool.query(
                `SELECT *
                 FROM projects
                 WHERE ${conditions.join(" AND ")}
                 LIMIT 1`,
                values
            );


        return mapRow(
            result.rows[0]
        );
    },


    // --------------------------------
    // Find One And Update
    // --------------------------------

    findOneAndUpdate:
        async (filter, data) => {

            const columnMap = {

                _id: "id",

                id: "id",

                user: "user_id",

                deploymentStatus:
                    "deployment_status",

                productionUrl:
                    "production_url",

                deploymentName:
                    "deployment_name",

                serviceName:
                    "service_name",

                ingressName:
                    "ingress_name",

                buildJobName:
                    "build_job_name",

                buildConfigMapName:
                    "build_config_map_name",

                sandboxID:
                    "sandbox_id",

                deployedAt:
                    "deployed_at",

                title:
                    "title",
            };


            const whereEntries =
                Object.entries(filter);

            const dataEntries =
                Object.entries(data);


            const whereConditions = [];
            const whereValues = [];

            let index = 1;


            // --------------------------------
            // WHERE
            // --------------------------------

            for (
                const [key, value]
                of whereEntries
            ) {

                const column =
                    columnMap[key];


                if (!column) {

                    throw new Error(
                        `Invalid Project filter field: ${key}`
                    );
                }


                whereConditions.push(
                    `${column} = $${index}`
                );


                whereValues.push(value);

                index++;
            }


            // --------------------------------
            // SET
            // --------------------------------

            const setFields = [];
            const setValues = [];


            for (
                const [key, value]
                of dataEntries
            ) {

                const column =
                    columnMap[key];


                if (!column) {

                    throw new Error(
                        `Invalid Project update field: ${key}`
                    );
                }


                setFields.push(
                    `${column} = $${index}`
                );


                setValues.push(value);

                index++;
            }


            setFields.push(
                `updated_at = NOW()`
            );


            const result =
                await pool.query(
                    `UPDATE projects
                     SET ${setFields.join(", ")}
                     WHERE ${whereConditions.join(" AND ")}
                     RETURNING *`,
                    [
                        ...whereValues,
                        ...setValues,
                    ]
                );


            return mapRow(
                result.rows[0]
            );
        },


    // --------------------------------
    // Find By ID And Update
    // --------------------------------

    findByIdAndUpdate:
        async (id, data) => {

            return Project.findOneAndUpdate(
                { id },
                data
            );
        },


    // --------------------------------
    // Create
    // --------------------------------

    create: async (data) => {

        const result =
            await pool.query(
                `INSERT INTO projects (
                    user_id,
                    title,
                    sandbox_id,
                    deployment_status,
                    production_url,
                    deployment_name,
                    service_name,
                    ingress_name,
                    build_job_name,
                    build_config_map_name,
                    deployed_at
                )
                VALUES (
                    $1, $2, $3, $4, $5,
                    $6, $7, $8, $9, $10, $11
                )
                RETURNING *`,
                [
                    data.user,
                    data.title,
                    data.sandboxID || null,

                    data.deploymentStatus ||
                        "not-deployed",

                    data.productionUrl ||
                        null,

                    data.deploymentName ||
                        null,

                    data.serviceName ||
                        null,

                    data.ingressName ||
                        null,

                    data.buildJobName ||
                        null,

                    data.buildConfigMapName ||
                        null,

                    data.deployedAt ||
                        null,
                ]
            );


        return mapRow(
            result.rows[0]
        );
    },
};


export default Project;

