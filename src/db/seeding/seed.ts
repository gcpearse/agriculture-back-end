import { db } from ".."
import format from "pg-format"
import { SeedData } from "../../types/seed-types"
import { generateHash } from "../../middleware/security"


export const seed = async (
  {
    userData,
    plotData,
    plotImageData,
    plotTypeData,
    subdivisionData,
    subdivisionImageData,
    subdivisionTypeData,
    cropData,
    cropNoteData,
    cropImageData,
    issueData,
    issueNoteData,
    issueImageData,
    jobData,
    jobImageData
  }: SeedData
) => {

  await db.query(`
    DROP TABLE IF EXISTS job_images;
    `)

  await db.query(`
    DROP TABLE IF EXISTS jobs;
    `)

  await db.query(`
    DROP TABLE IF EXISTS issue_images;
    `)

  await db.query(`
    DROP TABLE IF EXISTS issue_notes;
    `)

  await db.query(`
    DROP TABLE IF EXISTS issues;
    `)

  await db.query(`
    DROP TABLE IF EXISTS crop_images;
    `)

  await db.query(`
    DROP TABLE IF EXISTS crop_notes;
    `)

  await db.query(`
    DROP TABLE IF EXISTS crops;
    `)

  await db.query(`
    DROP TABLE IF EXISTS subdivision_types;
    `)

  await db.query(`
    DROP TABLE IF EXISTS subdivision_images;
    `)

  await db.query(`
    DROP TABLE IF EXISTS subdivisions;
    `)

  await db.query(`
    DROP TABLE IF EXISTS plot_types;
    `)

  await db.query(`
    DROP TABLE IF EXISTS plot_images;
    `)

  await db.query(`
    DROP TABLE IF EXISTS plots;
    `)

  await db.query(`
    DROP TABLE IF EXISTS users;
    `)

  await db.query(`
    DROP TYPE IF EXISTS unit_system;
    CREATE TYPE unit_system 
    AS ENUM 
      ('metric', 'imperial');
    `)

  await db.query(`
    CREATE TABLE users (
      user_id SERIAL PRIMARY KEY,
      username VARCHAR NOT NULL,
      password VARCHAR NOT NULL,
      email VARCHAR NOT NULL,
      first_name VARCHAR NOT NULL,
      surname VARCHAR NOT NULL,
      unit_preference unit_system NOT NULL DEFAULT 'metric',
      token VARCHAR,
      token_expiry TIMESTAMP
    );
    `)

  await db.query(`
    CREATE TABLE plots (
      plot_id SERIAL PRIMARY KEY,
      owner_id INT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
      name VARCHAR NOT NULL,
      type VARCHAR NOT NULL,
      description VARCHAR NOT NULL,
      location VARCHAR NOT NULL,
      area INT
    );
    `)

  await db.query(`
    CREATE TABLE plot_images (
      image_id SERIAL PRIMARY KEY,
      plot_id INT NOT NULL REFERENCES plots(plot_id) ON DELETE CASCADE,
      image_url TEXT NOT NULL
    );
    `)

  await db.query(`
    CREATE TABLE plot_types (
      plot_type_id SERIAL PRIMARY KEY,
      type VARCHAR NOT NULL
    );
    `)

  await db.query(`
    CREATE TABLE subdivisions (
      subdivision_id SERIAL PRIMARY KEY,
      plot_id INT NOT NULL REFERENCES plots(plot_id) ON DELETE CASCADE,
      name VARCHAR NOT NULL,
      type VARCHAR NOT NULL,
      description VARCHAR NOT NULL,
      area INT
    );
    `)

  await db.query(`
    CREATE TABLE subdivision_images (
      image_id SERIAL PRIMARY KEY,
      subdivision_id INT NOT NULL REFERENCES subdivisions(subdivision_id) ON DELETE CASCADE,
      image_url TEXT NOT NULL
    );
    `)

  await db.query(`
    CREATE TABLE subdivision_types (
      subdivision_type_id SERIAL PRIMARY KEY,
      type VARCHAR NOT NULL
    );
    `)

  await db.query(`
    CREATE TABLE crops (
      crop_id SERIAL PRIMARY KEY,
      plot_id INT NOT NULL REFERENCES plots(plot_id) ON DELETE CASCADE,
      subdivision_id INT REFERENCES subdivisions(subdivision_id) ON DELETE CASCADE,
      name VARCHAR NOT NULL,
      variety VARCHAR,
      quantity INT,
      date_planted DATE,
      harvest_date DATE
    );
    `)

  await db.query(`
    CREATE TABLE crop_notes (
      note_id SERIAL PRIMARY KEY,
      crop_id INT NOT NULL REFERENCES crops(crop_id) ON DELETE CASCADE,
      body TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    );
    `)

  await db.query(`
    CREATE TABLE crop_images (
      image_id SERIAL PRIMARY KEY,
      crop_id INT NOT NULL REFERENCES crops(crop_id) ON DELETE CASCADE,
      image_url TEXT NOT NULL
    );
    `)

  await db.query(`
    CREATE TABLE issues (
      issue_id SERIAL PRIMARY KEY,
      plot_id INT NOT NULL REFERENCES plots(plot_id) ON DELETE CASCADE,
      subdivision_id INT REFERENCES subdivisions(subdivision_id) ON DELETE CASCADE,
      title VARCHAR NOT NULL,
      description VARCHAR NOT NULL,
      is_resolved BOOLEAN DEFAULT FALSE
    );
    `)

  await db.query(`
    CREATE TABLE issue_notes (
      note_id SERIAL PRIMARY KEY,
      issue_id INT NOT NULL REFERENCES issues(issue_id) ON DELETE CASCADE,
      body TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    );
    `)

  await db.query(`
    CREATE TABLE issue_images (
      image_id SERIAL PRIMARY KEY,
      issue_id INT NOT NULL REFERENCES issues(issue_id) ON DELETE CASCADE,
      image_url TEXT NOT NULL
    );
    `)

  await db.query(`
    CREATE TABLE jobs (
      job_id SERIAL PRIMARY KEY,
      plot_id INT NOT NULL REFERENCES plots(plot_id) ON DELETE CASCADE,
      subdivision_id INT REFERENCES subdivisions(subdivision_id) ON DELETE CASCADE,
      crop_id INT REFERENCES crops(crop_id) ON DELETE CASCADE,
      issue_id INT REFERENCES issues(issue_id) ON DELETE CASCADE,
      title VARCHAR NOT NULL,
      description VARCHAR NOT NULL,
      date_added DATE DEFAULT NOW(),
      deadline DATE,
      is_started BOOLEAN DEFAULT FALSE,
      is_completed BOOLEAN DEFAULT FALSE
    );
    `)

  await db.query(`
    CREATE TABLE job_images (
      image_id SERIAL PRIMARY KEY,
      job_id INT NOT NULL REFERENCES jobs(job_id) ON DELETE CASCADE,
      image_url TEXT NOT NULL
    );
    `)

  await db.query(format(`
    INSERT INTO users 
      (username, password, email, first_name, surname, unit_preference)
    VALUES %L;
    `,
    await Promise.all(
      userData.map(async user => {
        const hashedPassword = await generateHash(user.password)
        return [
          user.username,
          hashedPassword,
          user.email,
          user.first_name,
          user.surname,
          user.unit_preference
        ]
      })
    )
  ))

  await db.query(format(`
    INSERT INTO plots 
      (owner_id, name, type, description, location, area)
    VALUES %L;
    `,
    plotData.map(entry => Object.values(entry))
  ))

  await db.query(format(`
    INSERT INTO plot_images 
      (plot_id, image_url)
    VALUES %L;
    `,
    plotImageData.map(entry => Object.values(entry))
  ))

  await db.query(format(`
    INSERT INTO plot_types 
      (type)
    VALUES %L;
    `,
    plotTypeData.map(entry => Object.values(entry))
  ))

  await db.query(format(`
    INSERT INTO subdivisions
      (plot_id, name, type, description, area)
    VALUES %L;
    `,
    subdivisionData.map(entry => Object.values(entry))
  ))

  await db.query(format(`
    INSERT INTO subdivision_images 
      (subdivision_id, image_url)
    VALUES %L;
    `,
    subdivisionImageData.map(entry => Object.values(entry))
  ))

  await db.query(format(`
    INSERT INTO subdivision_types 
      (type)
    VALUES %L;
    `,
    subdivisionTypeData.map(entry => Object.values(entry))
  ))

  await db.query(format(`
    INSERT INTO crops 
      (plot_id, subdivision_id, name, variety, quantity, date_planted, harvest_date)
    VALUES %L;
    `,
    cropData.map(entry => Object.values(entry))
  ))

  await db.query(format(`
    INSERT INTO crop_notes 
      (crop_id, body, created_at)
    VALUES %L;
    `,
    cropNoteData.map(entry => Object.values(entry))
  ))

  await db.query(format(`
    INSERT INTO crop_images 
      (crop_id, image_url)
    VALUES %L;
    `,
    cropImageData.map(entry => Object.values(entry))
  ))

  await db.query(format(`
    INSERT INTO issues 
      (plot_id, subdivision_id, title, description, is_resolved)
    VALUES %L;
    `,
    issueData.map(entry => Object.values(entry))
  ))

  await db.query(format(`
    INSERT INTO issue_notes 
      (issue_id, body, created_at)
    VALUES %L;
    `,
    issueNoteData.map(entry => Object.values(entry))
  ))

  await db.query(format(`
    INSERT INTO issue_images 
      (issue_id, image_url)
    VALUES %L;
    `,
    issueImageData.map(entry => Object.values(entry))
  ))

  await db.query(format(`
    INSERT INTO jobs 
      (plot_id, subdivision_id, crop_id, issue_id, title, description, date_added, deadline, is_started, is_completed)
    VALUES %L;
    `,
    jobData.map(entry => Object.values(entry))
  ))

  return await db.query(format(`
    INSERT INTO job_images 
      (job_id, image_url)
    VALUES %L;
    `,
    jobImageData.map(entry => Object.values(entry))
  ))
}
