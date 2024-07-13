import { db } from ".."
import format from "pg-format"
import { User } from "../../types/user-types"
import { Plot } from "../../types/plot-types"
import { Crop } from "../../types/crop-types"
import { Issue } from "../../types/issue-types"
import { Job } from "../../types/job-types"
import { CropImage, IssueImage, JobImage, PlotImage } from "../../types/image-types"
import { CropComment, IssueComment } from "../../types/comment-types"


export const seed = async ({
  userData,
  plotData,
  plotImageData,
  cropData,
  cropCommentData,
  cropImageData,
  issueData,
  issueCommentData,
  issueImageData,
  jobData,
  jobImageData
}: {
  userData: User[],
  plotData: Plot[],
  plotImageData: PlotImage[],
  cropData: Crop[],
  cropCommentData: CropComment[],
  cropImageData: CropImage[],
  issueData: Issue[],
  issueCommentData: IssueComment[],
  issueImageData: IssueImage[],
  jobData: Job[],
  jobImageData: JobImage[]
}) => {

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
    DROP TABLE IF EXISTS issue_comments;
    `)

  await db.query(`
    DROP TABLE IF EXISTS issues;
    `)

  await db.query(`
    DROP TABLE IF EXISTS crop_images;
    `)

  await db.query(`
    DROP TABLE IF EXISTS crop_comments;
    `)

  await db.query(`
    DROP TABLE IF EXISTS crops;
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
    CREATE TABLE users (
      user_id SERIAL PRIMARY KEY,
      username VARCHAR NOT NULL,
      password VARCHAR NOT NULL,
      first_name VARCHAR NOT NULL,
      surname VARCHAR NOT NULL,
      uses_metric BOOLEAN DEFAULT TRUE
    );
    `)

  await db.query(`
    CREATE TABLE plots (
      plot_id SERIAL PRIMARY KEY,
      owner_id INT NOT NULL REFERENCES users(user_id),
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
    CREATE TABLE crops (
      crop_id SERIAL PRIMARY KEY,
      plot_id INT NOT NULL REFERENCES plots(plot_id) ON DELETE CASCADE,
      name VARCHAR NOT NULL,
      variety VARCHAR,
      quantity INT,
      date_planted DATE,
      harvest_date DATE
    );
    `)

  await db.query(`
    CREATE TABLE crop_comments (
      comment_id SERIAL PRIMARY KEY,
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
      title VARCHAR NOT NULL,
      description VARCHAR NOT NULL,
      is_resolved BOOLEAN DEFAULT FALSE
    );
    `)

  await db.query(`
    CREATE TABLE issue_comments (
      comment_id SERIAL PRIMARY KEY,
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
      crop_id INT REFERENCES crops(crop_id),
      issue_id INT REFERENCES issues(issue_id),
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
      (username, password, first_name, surname, uses_metric)
    VALUES %L;
    `,
    userData.map(entry => Object.values(entry))
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
    INSERT INTO crops 
      (plot_id, name, variety, quantity, date_planted, harvest_date)
    VALUES %L;
    `,
    cropData.map(entry => Object.values(entry))
  ))

  await db.query(format(`
    INSERT INTO crop_comments 
      (crop_id, body, created_at)
    VALUES %L;
    `,
    cropCommentData.map(entry => Object.values(entry))
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
      (plot_id, title, description, is_resolved)
    VALUES %L;
    `,
    issueData.map(entry => Object.values(entry))
  ))

  await db.query(format(`
    INSERT INTO issue_comments 
      (issue_id, body, created_at)
    VALUES %L;
    `,
    issueCommentData.map(entry => Object.values(entry))
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
      (plot_id, crop_id, issue_id, title, description, date_added, deadline, is_started, is_completed)
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
